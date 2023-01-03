import * as functions from 'firebase-functions';
import * as fetch from 'node-fetch';

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//{[key: string]: number}
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

export const generateSitemap = functions.https.onRequest((request, response) => {
    const data = fetch('https://fluindotio-website-93127.firebaseio.com/posts.json');
    let sitemap = '';

    data.then((result) => result.json())
        .then((result) => {
            const posts: PostData = result as PostData;
            for (const key of Object.keys(posts)) {
                sitemap += `https://fluin.io/blog/${posts[key].id}\n`;
            }
            response.send(sitemap);
        })
        .catch((err) => {
            response.send({ msg: 'Error generating sitemap.', error: err });
        });
});

export const notFoundError = functions.https.onRequest((request, response) => {
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
