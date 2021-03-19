import * as functions from 'firebase-functions';
import * as fetch from 'node-fetch';

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const generateSitemap = functions.https.onRequest((request, response) => {
    const data = fetch('https://ng-fluin-io-default-rtdb.firebaseio.com/posts.json')
    let sitemap = '';

    data
    .then(result => result.json())
    .then(result => {
        const posts = result;
        for(const key in posts) {
            sitemap += `https://ng.fluin.io/blog/${posts[key].id}\n`;
        }
        response.send(sitemap)
    })
    .catch(err => {
        response.send({msg: 'Error generating sitemap.', error: err});
    })
});

export const notFoundError = functions.https.onRequest((request, response) => {
    const data = fetch('https://ng.fluin.io');
    data
    .then(result => result.text())
    .then(result => {
        response.set('Content-Type', 'text/html');
        response.status(404).send(result);
    })
    .catch(response.status(404).send('Page could not be found.'));
})
