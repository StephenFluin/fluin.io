import * as Prerenderer from 'puppeteer-prerender';
import * as fs from 'fs';
import * as child_process from 'child_process';

async function main() {
    console.log('PRERENDER Running ng build --prod');
    // const build = child_process.spawn('ng', ['build', '--prod']);
    const build = child_process.spawn('ls');
    // build.stdout.on('data', data => console.log('PRERENDER ng build output:', data));
    build.on('exit', () => {
        console.log('PRERENDER prod build complete');
        console.log('PRERENDER setting up server');
        const cp = child_process.spawn('npx', ['http-server', 'dist', '-p8000', '--proxy','http://localhost:8000?']);
        cp.stdout.on('data', async data => {
            console.log(`stdout data: ${data}`);
            if (/Available on/.test(data)) {
                setTimeout(async () => {
                    console.log('PRERENDER server ready');
                // Start rendering after server is up
                await render('http://localhost:8000/blog/5-things-to-do-after-ng-new', 'dist');
                //await render('http://woot.com', 'dist');

                // cp.kill();
                },1000);
            }
        });
        cp.stderr.on('data', data => console.error(`stderr data: ${data}`));
    });
}

async function render(url, destination) {
    const path = /^.*\/\/.*?\/(.*)$/.exec(url)[1];
    console.log('PRERENDER prerendering',url,'and', path);

    const prerender = new Prerenderer({debug:true,timeout:30000,followRedirect:true});

    try {
        const { status, redirect, meta, openGraph, links, html, staticHTML } = await prerender.render('http://localhost:8000/blog/5-things-to-do-after-ng-new');
        console.log('status was',status,'redirect was',redirect,'meta was',meta);
        fs.mkdir(`${destination}/blog`, () => {});
        // fs.writeFileSync(`${destination}/${path}`, staticHTML);
    } catch (e) {
        console.error(e);
    }

    await prerender.close();
}

main();
