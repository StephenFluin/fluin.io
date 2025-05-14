import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import compression from 'compression';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression());
const angularApp = new AngularNodeAppEngine();

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
