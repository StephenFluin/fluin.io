import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import compression from 'compression';
import { configureGenkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { defineFlow, startFlow } from 'genkit/flow';
import { geminiProVision } from '@genkit-ai/vertexai';
import * as z from 'zod';

// Configure Genkit
configureGenkit({
    plugins: [
        vertexAI({
            projectId: 'YOUR_PROJECT_ID', // Replace with your actual project ID
        }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});

// Define a simple text-to-image flow
export const textToImageFlow = defineFlow(
    {
        name: 'textToImageFlow',
        inputSchema: z.string(),
        outputSchema: z.string(), // Placeholder for actual image output type
    },
    async (prompt) => {
        // For now, this is a placeholder.
        // In a real scenario, you would call an image generation model.
        // Example (conceptual):
        // const image = await generateImage({ model: geminiProVision, prompt });
        // return image.url;
        console.log(`Generating image for prompt: ${prompt}`);
        return `Placeholder image for prompt: ${prompt}`;
    }
);

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression());
app.use(express.json()); // Enable JSON body parsing
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
// Endpoint to generate an image using Genkit flow
app.post('/api/generate-image', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Missing text prompt in request body' });
        }

        const result = await startFlow(textToImageFlow, text);
        res.json({ imageUrl: result });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image' });
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
