"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fetch = require("node-fetch");
// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.generateSitemap = functions.https.onRequest((request, response) => {
    const data = fetch('https://fluindotio-website-93127.firebaseio.com/posts.json');
    let sitemap = '';
    data
        .then(result => result.json())
        .then(result => {
        const posts = result;
        for (const key in posts) {
            sitemap += `https://fluin.io/blog/${posts[key].id}\n`;
        }
        response.send(sitemap);
    })
        .catch(err => {
        response.send({ msg: 'Error generating sitemap.', error: err });
    });
});
//# sourceMappingURL=index.js.map