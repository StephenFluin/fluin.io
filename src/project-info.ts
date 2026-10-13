import type { Reference } from 'firebase-admin/database';
import {
    PROJECTS,
    type DataStore,
    type Framework,
    type Host,
    type Project,
    type ProjectInfo,
    type Rendering,
} from './app/shared/projects';

/**
 * What each project is built with and when it last changed, for the projects page.
 *
 * Each field comes from the first source that knows it:
 *  1. GitHub: repo metadata (with GITHUB_TOKEN, so private repos work) and, for public repos,
 *     package.json, firebase.json and apphosting.yaml
 *  2. The live site: response headers, ng-version / ng-server-context in the HTML, or the
 *     ng-version string compiled into its JavaScript for client-rendered apps
 *  3. The project's hardcoded `tech` in PROJECTS
 *
 * Scans take a few seconds, so reading (`get`) only ever returns the cache. Scanning (`refresh`)
 * happens in its own request, which the projects page sends after it loads. It can't run in the
 * background after a response: Cloud Run throttles the CPU between requests, so every fetch would
 * time out. The cache lives in memory and in the realtime db, so it survives cold starts and is
 * shared across instances.
 */

interface DetectedInfo extends ProjectInfo {
    name: string;
}

interface ProjectInfoCache {
    expiresAt: number;
    projects: DetectedInfo[];
}

const CACHE_TTL_MS = 60 * 60 * 1000;
/** Scans where something failed are retried sooner, so a bad scan doesn't stick for an hour */
const FAILED_SCAN_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;

export function createProjectInfoCache(dbRef: Reference | null) {
    let cache: ProjectInfoCache | null = null;
    let loadedFromDb: Promise<void> | null = null;
    let scanning: Promise<boolean> | null = null;

    // Without a token private repos can't be read, so a local dev server must not overwrite production's cache
    const canWriteDb = !!process.env['GITHUB_TOKEN'];

    async function readDb(): Promise<ProjectInfoCache | null> {
        try {
            return (await dbRef?.get())?.val() ?? null;
        } catch (error) {
            console.error('Project info cache read failed', error);
            return null;
        }
    }

    async function loadOnce() {
        loadedFromDb ??= readDb().then((stored) => void (cache ??= stored));
        await loadedFromDb;
    }

    /** Scan if the cache has expired. Resolves true if a scan ran. */
    async function scanIfStale(): Promise<boolean> {
        // Another instance may have refreshed the shared cache already
        const stored = await readDb();
        if (isFresh(stored)) {
            cache = stored;
            return false;
        }

        const fresh = await scanAll(cache ?? stored);
        cache = fresh;
        if (dbRef && canWriteDb) {
            // The realtime db rejects undefined values
            await dbRef.set(JSON.parse(JSON.stringify(fresh)));
        }
        return true;
    }

    return {
        /** Cached project info keyed by project name, with hardcoded fallbacks applied. Never scans. */
        async get(): Promise<Record<string, ProjectInfo>> {
            await loadOnce();
            return withFallbacks(cache);
        },

        /** Scan if the cache has expired, sharing one scan between concurrent callers. Resolves true if a scan ran. */
        async refresh(): Promise<boolean> {
            await loadOnce();
            if (isFresh(cache)) {
                return false;
            }
            scanning ??= scanIfStale().finally(() => (scanning = null));
            return scanning;
        },
    };
}

function isFresh(cache: ProjectInfoCache | null): cache is ProjectInfoCache {
    return !!cache?.expiresAt && Date.now() < cache.expiresAt;
}

function withFallbacks(cache: ProjectInfoCache | null): Record<string, ProjectInfo> {
    const result: Record<string, ProjectInfo> = {};
    for (const project of PROJECTS) {
        const detected = cache?.projects?.find((entry) => entry.name === project.name);
        const fallback = project.tech ?? {};
        result[project.name] = {
            updatedAt: detected?.updatedAt,
            framework: detected?.framework ?? fallback.framework,
            version: detected?.version ?? fallback.version,
            rendering: detected?.rendering ?? fallback.rendering,
            host: detected?.host ?? fallback.host,
            dataStores: detected?.dataStores ?? fallback.dataStores,
        };
    }
    return result;
}

async function scanAll(previous: ProjectInfoCache | null): Promise<ProjectInfoCache> {
    let anyFailed = false;
    const onFailure = (source: string, project: Project, error: unknown) => {
        anyFailed = true;
        console.error(`${source} scan failed for ${project.name}`, error);
    };

    const projects = await Promise.all(
        PROJECTS.map(async (project): Promise<DetectedInfo> => {
            const stale = previous?.projects?.find((entry) => entry.name === project.name);
            try {
                // Keep anything this scan couldn't find, so a failed request doesn't blank a field
                return { ...stale, ...definedOnly(await scanProject(project, onFailure)), name: project.name };
            } catch (error) {
                onFailure('Project info', project, error);
                return { ...stale, name: project.name };
            }
        })
    );
    return { expiresAt: Date.now() + (anyFailed ? FAILED_SCAN_TTL_MS : CACHE_TTL_MS), projects };
}

async function scanProject(
    project: Project,
    onFailure: (source: string, project: Project, error: unknown) => void
): Promise<ProjectInfo> {
    const [github, live] = await Promise.all([
        scanGithub(project).catch((error) => {
            onFailure('GitHub', project, error);
            return {} as ProjectInfo;
        }),
        scanLiveSite(project.url).catch((error) => {
            onFailure('Live site', project, error);
            return {} as LiveInfo;
        }),
    ]);

    let framework = github.framework ?? live.framework;
    let version = github.version ?? live.version;
    let rendering = live.rendering;

    // Client-rendered apps only reveal their Angular version in their JavaScript
    if (!version && live.scripts?.length && (!framework || framework === 'Angular')) {
        const bundleVersion = await findAngularVersionInBundles(project.url, live.scripts).catch(() => undefined);
        if (bundleVersion) {
            framework = 'Angular';
            version = bundleVersion;
        }
    }
    if (!rendering && framework === 'Angular' && live.html) {
        rendering = 'client';
    }

    return {
        updatedAt: github.updatedAt,
        framework,
        version,
        rendering,
        host: github.host ?? live.host,
        dataStores: github.dataStores,
    };
}

/* ---------------------------------- GitHub ---------------------------------- */

async function scanGithub(project: Project): Promise<ProjectInfo> {
    if (!project.repo) {
        return {};
    }

    const repo = await fetchGithubRepo(project.repo);
    const info: ProjectInfo = { updatedAt: repo.pushed_at };

    // Private repo contents would need more than the token's metadata permission
    if (repo.private) {
        return info;
    }

    const dir = project.repoDir ? `${project.repoDir}/` : '';
    const raw = (path: string) => fetchOptionalText(`https://raw.githubusercontent.com/${project.repo}/HEAD/${dir}${path}`);
    const [packageText, firebaseText, appHostingText] = await Promise.all([
        raw('package.json'),
        raw('firebase.json'),
        raw('apphosting.yaml'),
    ]);

    const pkg = packageText ? JSON.parse(packageText) : {};
    const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
    const firebase = firebaseText ? JSON.parse(firebaseText) : {};

    const frameworks: [Framework, string][] = [
        ['Angular', '@angular/core'],
        ['Eleventy', '@11ty/eleventy'],
    ];
    const found = frameworks.find(([, dep]) => deps[dep]);
    if (found) {
        info.framework = found[0];
        info.version = majorVersion(deps[found[1]]);
    }

    if (appHostingText !== null) {
        info.host = 'app-hosting';
    } else if (firebase.hosting) {
        info.host = 'firebase-hosting';
    } else if (repo.has_pages) {
        info.host = 'github-pages';
    }

    if (packageText || firebaseText) {
        const dataStores: DataStore[] = [];
        if (firebase.database) dataStores.push('rtdb');
        if (firebase.firestore) dataStores.push('firestore');
        if (firebase.storage) dataStores.push('storage');
        // The mysql drivers can't tell MySQL from MariaDB, and every SQL project here runs MariaDB
        if (deps['mariadb'] || deps['mysql'] || deps['mysql2']) dataStores.push('mariadb');
        info.dataStores = dataStores;
    }

    return info;
}

async function fetchGithubRepo(repo: string): Promise<{ pushed_at: string; private: boolean; has_pages: boolean }> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'fluin.io',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = process.env['GITHUB_TOKEN'];
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}`, {
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} for ${repo}`);
    }
    return response.json();
}

/* --------------------------------- Live site -------------------------------- */

interface LiveInfo extends ProjectInfo {
    html?: string;
    /** Script URLs the page loads, for finding the Angular version in client-rendered apps */
    scripts?: string[];
}

async function scanLiveSite(url: string): Promise<LiveInfo> {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
    }
    const html = await response.text();
    const info: LiveInfo = { html, host: hostFromHeaders(response.headers) };

    const ngVersion = html.match(/ng-version="(\d+)\./);
    if (ngVersion) {
        info.framework = 'Angular';
        info.version = ngVersion[1];
    }

    const serverContext = html.match(/ng-server-context="(ssr|ssg)/);
    if (serverContext) {
        info.rendering = serverContext[1] as Rendering;
    }

    info.scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => new URL(match[1], response.url).href);
    return info;
}

function hostFromHeaders(headers: Headers): Host | undefined {
    if (headers.get('server') === 'GitHub.com') {
        return 'github-pages';
    }
    // App Hosting tags responses with "<project number>:<backend>"
    if (headers.get('cache-tag')?.includes(':')) {
        return 'app-hosting';
    }
    // Firebase Hosting's CDN; GitHub Pages uses it too but is caught above
    if (headers.get('x-served-by')?.startsWith('cache-')) {
        return 'firebase-hosting';
    }
    return undefined;
}

/**
 * Angular compiles its version into the code that adds the ng-version attribute, e.g.
 * ["ng-version","21.1.2"]. Newer builds may keep it in a chunk imported by main, and older
 * ones (v16) only as `new Version("16.0.0")` with a minified class name.
 */
async function findAngularVersionInBundles(pageUrl: string, scripts: string[]): Promise<string | undefined> {
    const main = scripts.find((src) => /\/main[.-]/.test(src)) ?? scripts.at(-1);
    if (!main) {
        return undefined;
    }

    const mainText = await fetchOptionalText(main);
    if (!mainText) {
        return undefined;
    }

    const chunkUrls = [...new Set(mainText.match(/\.\/chunk-[A-Za-z0-9]+\.js/g) ?? [])].map(
        (chunk) => new URL(chunk, main).href
    );
    const chunks = await Promise.all(chunkUrls.map((chunk) => fetchOptionalText(chunk).catch(() => null)));

    for (const text of [mainText, ...chunks]) {
        const version = text?.match(/["'`]ng-version["'`]\s*,\s*["'`](\d+)\./)?.[1];
        if (version) {
            return version;
        }
    }
    return mainText.match(/new [A-Za-z_$][\w$]{0,3}\("(\d+)\.\d+\.\d+/)?.[1];
}

/* ---------------------------------- Helpers --------------------------------- */

/** The response body, or null if the file doesn't exist */
async function fetchOptionalText(url: string): Promise<string | null> {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
    }
    return response.text();
}

/** "^22.2.1" → "22" */
function majorVersion(range: string) {
    return range.match(/(\d+)\./)?.[1] ?? range.match(/\d+/)?.[0];
}

function definedOnly<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
