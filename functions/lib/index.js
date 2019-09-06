"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
admin.initializeApp(functions.config().firebase);
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
exports.notFoundError = functions.https.onRequest((request, response) => {
    const data = fetch('https://fluin.io');
    data
        .then(result => result.text())
        .then(result => {
        response.set('Content-Type', 'text/html');
        response.status(404).send(result);
    })
        .catch(response.status(404).send('Page could not be found.'));
});
exports.postList = functions.https.onRequest((request, response) => {
    const ref = admin.database().ref('/posts/');
    console.log('starting homepagepost lookup', ref);
    // admin.database().ref('posts').
    ref.once('value')
        .then(snapshot => {
        console.log('in the oncreate', snapshot);
        // response.send('OnCreate returned from fb ref.');
        const maxAge = 60 * 1; // 30 minutes
        response.set(`Cache-Control', 'public, max-age=${maxAge}, s-maxage=${maxAge}`);
        const allPosts = snapshot.val();
        const result = [];
        for (const key of Object.keys(allPosts)) {
            const post = allPosts[key];
            result.push({ date: post.date, title: post.title, image: post.image });
        }
        result.sort((a, b) => a.date > b.date ? 1 : -1);
        response.send(result);
        return;
    })
        .catch(err => {
        response.status(500).send("Couldn't load db:" + err);
    });
    // response.status(200).send({"working:":true});
});
//# sourceMappingURL=index.js.map