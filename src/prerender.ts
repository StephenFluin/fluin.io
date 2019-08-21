import * as Prerenderer from 'puppeteer-prerender';
import * as fs from 'fs';

async function render(url, destination) {
    const prerender = new Prerenderer();

    try {
        const {
            status,
            redirect,
            meta,
            openGraph,
            links,
            html,
            staticHTML
        } = await prerender.render(url);
        console.log('url', url);
        const path = /^.*\/\/.*?\/(.*)$/.exec(url)[1];
        console.log('figured out path is',path);
        fs.writeFileSync(`${destination}/${path}`,staticHTML)
    } catch (e) {
        console.error(e);
    }

    await prerender.close();
}

render('http://localhost:4200/blog/5-things-to-do-after-ng-new', 'dist');