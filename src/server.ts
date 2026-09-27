import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import compression from 'compression';
import sharp from 'sharp';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { ALLOWED_IMAGE_QUALITIES, ALLOWED_IMAGE_SIZES, isOptimizableImage } from './app/shared/image-url';
import { isPublished, publishedAt } from './app/shared/post-dates';
import { createMarkdownRenderer } from './app/shared/markdown';

// Initialize firebase-admin once (uses Application Default Credentials in App Hosting / Cloud Run).
let cacheBucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null = null;
try {
    if (!getApps().length) initializeApp();
    cacheBucket = getStorage().bucket('fluindotio-website-93127.appspot.com');
} catch (e) {
    console.warn('firebase-admin init failed — image cache disabled', e);
}

/**
 * Two-tier image cache.
 *
 * L1 — in-process Map<key, Buffer>: instant for repeat requests within the
 *       same instance lifetime.  Evicts oldest entry when over MEM_CACHE_MAX.
 *
 * L2 — Firebase Storage at `_image-cache/…`: persistent across restarts and
 *       shared across instances.  knownInStorage tracks keys already verified
 *       present so we only pay a Storage round-trip once per key per cold start.
 */
const memCache = new Map<string, { buf: Buffer; type: string }>();
const MEM_CACHE_MAX = 100;
const knownInStorage = new Set<string>();

function imageCacheKey(url: string, w: number, h: number | undefined, q: number, fit: string, fmt: string) {
    return `${w}|${h ?? ''}|${q}|${fit}|${fmt}|${url}`;
}

function imageCachePath(url: string, w: number, h: number | undefined, q: number, fit: string, fmt: string) {
    const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
    const basename = url.split('/').pop()?.replace(/\?.*/, '') ?? 'img';
    return `_image-cache/${fmt}/${w}x${h ?? '0'}_q${q}_${fit}/${hash}_${basename}.${fmt}`;
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression());
const angularApp = new AngularNodeAppEngine();
const markdown = await createMarkdownRenderer();

/** A post as stored in the realtime db */
interface StoredPost {
    id: string;
    title?: string;
    date?: string;
    image?: string;
    body?: string;
}

function parseFit(value: unknown) {
    return value === 'inside' ? 'inside' : 'cover';
}

function pickOutputFormat(acceptHeader: string | undefined) {
    const accept = acceptHeader || '';

    if (accept.includes('image/avif')) {
        return 'avif' as const;
    }

    if (accept.includes('image/webp')) {
        return 'webp' as const;
    }

    return 'jpeg' as const;
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
const POSTS_URL = 'https://fluindotio-website-93127.firebaseio.com/posts.json';
const POST_URL = (id: string) => `https://fluindotio-website-93127.firebaseio.com/posts/${id}.json`;
const VALID_POST_ID = /^[A-Za-z0-9_-]+$/;

/**
 * Server-side cache for Firebase posts.json.
 * Reduces redundant fetches from /api/posts, /api/posts/:id, /sitemap.txt, /feed.xml.
 * TTL: 60 seconds, matches HTTP cache max-age.
 */
interface PostsCache {
    data: Record<string, StoredPost>;
    timestamp: number;
}
let postsCache: PostsCache | null = null;
const CACHE_TTL_MS = 60 * 1000;

async function getPostsFromFirebase(): Promise<Record<string, StoredPost>> {
    const now = Date.now();
    if (postsCache && now - postsCache.timestamp < CACHE_TTL_MS) {
        return postsCache.data;
    }

    const response = await fetch(POSTS_URL);
    if (!response.ok) {
        throw new Error(`Firebase returned ${response.status}`);
    }

    const data = await response.json();
    postsCache = { data, timestamp: now };
    return data;
}

/**
 * Get a single post, or null if it doesn't exist.
 * Posts missing from the cached list are checked directly, so a just-published post is visible immediately.
 */
async function getPostFromFirebase(id: string): Promise<StoredPost | null> {
    if (!VALID_POST_ID.test(id)) {
        return null;
    }

    const posts = await getPostsFromFirebase();
    if (Object.hasOwn(posts, id)) {
        return posts[id];
    }

    const response = await fetch(POST_URL(id));
    if (!response.ok) {
        throw new Error(`Firebase returned ${response.status}`);
    }
    return response.json();
}

app.get('/api/posts', async (_req, res) => {
    try {
        const data = await getPostsFromFirebase();

        // List views only need title/date/id/image. Full content is served by /api/posts/:id.
        const summaries: Record<string, unknown> = {};
        for (const key of Object.keys(data)) {
            const { id, title, date, image } = data[key];
            summaries[key] = { id, title, date, image };
        }

        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
        res.json(summaries);
    } catch (error) {
        console.error('Posts proxy error', error);
        res.status(500).send('Unable to load posts.');
    }
});

app.get('/api/posts/:id', async (req, res) => {
    const id = req.params['id'];

    try {
        const post = await getPostFromFirebase(id);

        if (!post) {
            res.status(404).send('Post not found.');
            return;
        }

        // Render markdown server-side so blog pages don't need to download
        // markdown-it in the browser during hydration.
        const renderedBody = typeof post.body === 'string' ? markdown.render(post.body) : '';
        const { id: postId, title, date, image, body } = post;
        const responsePost = { id: postId, title, date, image, body, renderedBody };

        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
        res.json(responsePost);
    } catch (error) {
        console.error('Post proxy error', error);
        res.status(500).send('Unable to load post.');
    }
});

app.get('/api/image', async (req, res) => {
    const source = Array.isArray(req.query['url']) ? req.query['url'][0] : req.query['url'];

    if (typeof source !== 'string' || !source) {
        res.status(400).send('Missing image URL.');
        return;
    }

    if (!isOptimizableImage(source)) {
        res.status(400).send('Unsupported image host.');
        return;
    }
    const remoteUrl = new URL(source);

    // Only serve the sizes the app uses, so the cache can't be filled with arbitrary variants
    const width = Number(req.query['w']);
    const height = Number(req.query['h']);
    const quality = Number(req.query['q']);
    if (!ALLOWED_IMAGE_SIZES.has(`${width}x${height}`) || !ALLOWED_IMAGE_QUALITIES.has(quality)) {
        res.status(400).send('Unsupported image size or quality.');
        return;
    }
    const fit = parseFit(req.query['fit']);
    const format = pickOutputFormat(req.headers.accept);
    const contentType = `image/${format}` as const;

    const cacheKey = imageCacheKey(source, width, height, quality, fit, format);

    // ── L1: in-memory cache ──────────────────────────────────────────────────
    const cached = memCache.get(cacheKey);
    if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800');
        res.setHeader('Content-Type', cached.type);
        res.setHeader('Vary', 'Accept');
        res.setHeader('X-Cache', 'HIT-MEMORY');
        res.send(cached.buf);
        return;
    }

    const storagePath = imageCachePath(source, width, height, quality, fit, format);

    function serveBuffer(buf: Buffer) {
        // Populate L1
        if (memCache.size >= MEM_CACHE_MAX) {
            memCache.delete(memCache.keys().next().value!);
        }
        memCache.set(cacheKey, { buf, type: contentType });

        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Vary', 'Accept');
        res.send(buf);
    }

    // ── L2: Firebase Storage cache ──────────────────────────────────────────
    if (cacheBucket && knownInStorage.has(cacheKey)) {
        // We know it's in Storage from an earlier request this instance.
        try {
            const [buf] = await cacheBucket.file(storagePath).download();
            res.setHeader('X-Cache', 'HIT-STORAGE');
            serveBuffer(buf);
            return;
        } catch {
            // Storage miss despite being in the set — fall through to re-process.
            knownInStorage.delete(cacheKey);
        }
    }

    // ── L2 cold-start check ─────────────────────────────────────────────────
    if (cacheBucket && !knownInStorage.has(cacheKey)) {
        try {
            const [buf] = await cacheBucket.file(storagePath).download();
            knownInStorage.add(cacheKey);
            res.setHeader('X-Cache', 'HIT-STORAGE-COLD');
            serveBuffer(buf);
            return;
        } catch {
            // Not in Storage yet — fall through to process.
        }
    }

    // ── Process from source ─────────────────────────────────────────────────
    try {
        const response = await fetch(remoteUrl, {
            headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' },
        });

        if (!response.ok) {
            res.status(502).send('Unable to fetch image.');
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const pipeline = sharp(Buffer.from(arrayBuffer), { failOn: 'none' })
            .rotate()
            .resize({ width, height, fit, withoutEnlargement: true });

        const output =
            format === 'avif'
                ? await pipeline.avif({ quality }).toBuffer()
                : format === 'webp'
                  ? await pipeline.webp({ quality }).toBuffer()
                  : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

        // Write to Storage in the background — don't block the response.
        if (cacheBucket) {
            cacheBucket
                .file(storagePath)
                .save(output, { metadata: { contentType } })
                .then(() => knownInStorage.add(cacheKey))
                .catch((err) => console.error('Image cache write failed', err));
        }

        res.setHeader('X-Cache', 'MISS');
        serveBuffer(output);
    } catch (error) {
        console.error('Image proxy error', error);
        res.status(500).send('Unable to optimize image.');
    }
});

/** Posts whose date has arrived, newest first */
function publishedPosts(posts: Record<string, StoredPost>) {
    return Object.values(posts)
        .filter(isPublished)
        .sort((a, b) => b.date!.localeCompare(a.date!));
}

app.get('/sitemap.txt', async (req, res) => {
    try {
        const posts = await getPostsFromFirebase();
        let sitemap = '';

        // Drafts and future-dated posts stay out of search engines until they're published
        for (const post of publishedPosts(posts)) {
            sitemap += `https://fluin.io/blog/${post.id}\n`;
        }
        sitemap += `https://fluin.io/blog\n`;
        sitemap += `https://fluin.io\n`;
        sitemap += `https://fluin.io/bio\n`;
        sitemap += `https://fluin.io/projects\n`;

        res.set('Content-Type', 'text/plain');
        res.send(sitemap);
    } catch (err) {
        console.error('Sitemap error', err);
        res.status(500).send('Unable to generate sitemap.');
    }
});

const FEED_SIZE = 20;

function escapeXml(text: string) {
    return text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

/** Wrap HTML for an XML element, splitting any "]]>" that would end the CDATA section early */
function cdata(html: string) {
    return `<![CDATA[${html.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

/**
 * The first paragraph of a post as plain text, like the blog page's meta description.
 * markdown-it escapes & < > and ", so once tags are stripped the text is already XML-safe.
 */
function summary(body = '') {
    const firstParagraph = body.split('\n').find((line) => line.trim() && !line.trim().startsWith('#')) ?? '';
    return markdown.renderInline(firstParagraph.trim()).replace(/<[^>]+>/g, '');
}

/** RSS 2.0 feed of the most recent published posts, with full content */
app.get('/feed.xml', async (req, res) => {
    try {
        const posts = publishedPosts(await getPostsFromFirebase()).slice(0, FEED_SIZE);
        const rfc822 = (date: string) => publishedAt(date).toUTCString();

        const items = posts.map((post) => {
            const url = `https://fluin.io/blog/${post.id}`;
            const cover = post.image ? `<p><img src="${escapeXml(post.image)}" alt="" /></p>` : '';
            return `
    <item>
      <title>${escapeXml(post.title ?? post.id)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(post.date!)}</pubDate>
      <description>${summary(post.body)}</description>
      <content:encoded>${cdata(cover + markdown.render(post.body ?? ''))}</content:encoded>
    </item>`;
        });

        const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>fluin.io blog</title>
    <link>https://fluin.io/blog</link>
    <description>Stephen Fluin writing about Angular, product, developer relations, and developer tools.</description>
    <language>en-us</language>
    <atom:link href="https://fluin.io/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${posts.length ? rfc822(posts[0].date!) : new Date().toUTCString()}</lastBuildDate>${items.join('')}
  </channel>
</rss>
`;

        res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
        res.send(feed);
    } catch (err) {
        console.error('Feed error', err);
        res.status(500).send('Unable to generate feed.');
    }
});

/**
 * Serve static files from /browser.
 * Build output is content-hashed (e.g. chunk-Cx8mLFjm.js) so it can be cached forever. Everything else
 * (images, icons, robots.txt) keeps its name when it changes, so it gets a short cache.
 */
const HASHED_BUILD_FILE = /-[A-Za-z0-9_-]{8}\.(?:js|css)$/;
app.use(
    express.static(browserDistFolder, {
        index: false,
        redirect: false,
        setHeaders: (res, path) => {
            res.setHeader(
                'Cache-Control',
                HASHED_BUILD_FILE.test(path) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'
            );
        },
    })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
    angularApp
        .handle(req)
        .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
        .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, (error) => {
        if (error) {
            throw error;
        }

        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

console.log('App request handler created');
