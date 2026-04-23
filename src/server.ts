import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import compression from 'compression';
import sharp from 'sharp';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression());
const angularApp = new AngularNodeAppEngine();
const ALLOWED_FIREBASE_BUCKET = 'fluindotio-website-93127.appspot.com';
const ALLOWED_IMAGE_HOST = 'firebasestorage.googleapis.com';
const ALLOWED_IMAGE_PATH_PREFIX = `/v0/b/${ALLOWED_FIREBASE_BUCKET}/`;

interface PostData {
    [key: string]: {
        body: string;
        date: string;
        id: string;
        image: string;
        title: string;
        images: any;
        renderedBody: any;
    };
}

function parsePositiveInteger(value: unknown, fallback: number, max: number) {
    const parsed = Number.parseInt(String(value || ''), 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return Math.min(parsed, max);
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

app.get('/api/posts', async (_req, res) => {
    try {
        const response = await fetch(POSTS_URL);

        if (!response.ok) {
            res.status(502).send('Unable to fetch posts.');
            return;
        }

        const data = await response.json();

        // Strip post body — list views only need title/date/id/image.
        // Full content is served by /api/posts/:id.
        const summaries: Record<string, unknown> = {};
        for (const key of Object.keys(data)) {
            const { body: _body, ...summary } = data[key];
            summaries[key] = summary;
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
        const response = await fetch(POSTS_URL);

        if (!response.ok) {
            res.status(502).send('Unable to fetch posts.');
            return;
        }

        const data = await response.json();
        const post = data[id];

        if (!post) {
            res.status(404).send('Post not found.');
            return;
        }

        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
        res.json(post);
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

    let remoteUrl: URL;

    try {
        remoteUrl = new URL(source);
    } catch {
        res.status(400).send('Invalid image URL.');
        return;
    }

    if (remoteUrl.hostname !== ALLOWED_IMAGE_HOST || !remoteUrl.pathname.startsWith(ALLOWED_IMAGE_PATH_PREFIX)) {
        res.status(400).send('Unsupported image host.');
        return;
    }

    const width = parsePositiveInteger(req.query['w'], 1200, 2400);
    const height = req.query['h'] ? parsePositiveInteger(req.query['h'], 675, 2400) : undefined;
    const quality = parsePositiveInteger(req.query['q'], 72, 90);
    const fit = parseFit(req.query['fit']);
    const format = pickOutputFormat(req.headers.accept);

    try {
        const response = await fetch(remoteUrl, {
            headers: {
                Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            res.status(502).send('Unable to fetch image.');
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const pipeline = sharp(Buffer.from(arrayBuffer), { failOn: 'none' })
            .rotate()
            .resize({
                width,
                height,
                fit,
                withoutEnlargement: true,
            });

        const output =
            format === 'avif'
                ? await pipeline.avif({ quality }).toBuffer()
                : format === 'webp'
                  ? await pipeline.webp({ quality }).toBuffer()
                  : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800');
        res.setHeader('Content-Type', `image/${format}`);
        res.setHeader('Vary', 'Accept');
        res.send(output);
    } catch (error) {
        console.error('Image proxy error', error);
        res.status(500).send('Unable to optimize image.');
    }
});

app.get('/sitemap.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    const data = fetch('https://fluindotio-website-93127.firebaseio.com/posts.json');
    let sitemap = '';

    data.then((result) => result.json())
        .then((result) => {
            const posts: PostData = result as PostData;
            for (const key of Object.keys(posts)) {
                sitemap += `https://fluin.io/blog/${posts[key].id}\n`;
            }
            sitemap += `https://fluin.io/blog\n`;
            sitemap += `https://fluin.io\n`;
            sitemap += `https://fluin.io/bio\n`;

            res.send(sitemap);
        })
        .catch((err) => {
            res.send({ msg: 'Error generating sitemap.', error: err });
        });
});
app.get('/404', (req, res) => {
    res.status(404);
    req.next();
});

/**
 * Serve static files from /browser
 */
app.use(
    express.static(browserDistFolder, {
        maxAge: '1y',
        index: false,
        redirect: false,
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
