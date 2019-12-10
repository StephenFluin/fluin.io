import * as Prerenderer from 'puppeteer-prerender';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { getUrls } from './url-list';

async function main() {
    console.log('PRERENDER Running ng build --prod');
    const build = child_process.spawn('ng', ['build', '--prod']);
    // const build = child_process.spawn('ls');
    // build.stdout.on('data', data => console.log('PRERENDER ng build output:', data));
    build.on('exit', () => {
        console.log('PRERENDER prod build complete');
        console.log('PRERENDER setting up server');
        const cp = child_process.spawn('npx', ['http-server', 'dist', '-p8000', '--proxy', 'http://localhost:8000?']);
        fs.copyFileSync('dist/index.html', 'dist/index-sw.html');
        cp.stdout.on('data', async data => {
            // console.log(`stdout data: ${data}`);
            if (/Available on/.test(data)) {
                setTimeout(async () => {
                    console.log('PRERENDER server ready');
                    // Start rendering after server is up
                    const urlList = await getUrls();
                    for (const url of urlList) {
                        await render(`http://localhost:8000${url}`, 'dist');
                    }

                    cp.kill();
                }, 1000);
            }
        });
        cp.stderr.on('data', data => console.error(`stderr data: ${data}`));
    });
}

async function render(url, destination) {
    const path = /^.*\/\/.*?\/(.*)$/.exec(url)[1];
    console.log(`PRERENDER prerendering ${url} to ${path} in ${destination}.`);

    const prerender = new Prerenderer({ debug: false, timeout: 30000, followRedirect: true });

    try {
        const { status, redirect, meta, openGraph, links, html, staticHTML } = await prerender.render(url);
        // console.log('status was', status, 'redirect was', redirect, 'meta was', meta);
        // console.log('creating',`${destination}/${path.substring(0,path.lastIndexOf('/'))}`);
        fs.mkdirSync(`${destination}/${path.substring(0,path.lastIndexOf('/'))}`, {recursive: true});
        fs.writeFileSync(`${destination}/${path}`, html);
    } catch (e) {
        console.error(e);
    }

    await prerender.close();
}

main().catch(error => console.error(error));
