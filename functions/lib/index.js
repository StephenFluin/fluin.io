"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundError = exports.generateSitemap = void 0;
const functions = require("firebase-functions");
const fetch = require("node-fetch");
exports.generateSitemap = functions.https.onRequest((request, response) => {
    const data = fetch('https://fluindotio-website-93127.firebaseio.com/posts.json');
    let sitemap = '';
    data.then((result) => result.json())
        .then((result) => {
        const posts = result;
        for (const key of Object.keys(posts)) {
            sitemap += `https://fluin.io/blog/${posts[key].id}\n`;
        }
        response.send(sitemap);
    })
        .catch((err) => {
        response.send({ msg: 'Error generating sitemap.', error: err });
    });
});
exports.notFoundError = functions.https.onRequest((request, response) => {
    const data = fetch('https://fluin.io');
    data.then((result) => result.text())
        .then((result) => {
        response.set('Content-Type', 'text/html');
        response.status(404).send(result);
    })
        .catch((err) => {
        response.status(404).send('Page could not be found.');
    });
});
//# sourceMappingURL=index.js.map