import * as fs from 'fs';
import * as child_process from 'child_process';
import * as puppeteer from 'puppeteer';
import { getUrls } from './url-list';


let browser;

async function main() {
    console.log('Setup browser');
    browser = await puppeteer.launch({headless:true});
    
    console.log('PRERENDER Running ng build');
    const build = child_process.spawn('ng', ['build']);
    
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
                    browser.close();
                    console.log("server and browser closed.");

                    setTimeout(() => {
                        // @TODO this is a hack, figure out why the threads aren't closing properly
                        process.exit();
                        console.log("server force quit");
                    },5000);
                }, 1000);
            }
        });
        cp.stderr.on('data', data => console.error(`stderr data: ${data}`));

        
    });
}

async function render(url, destination) {
        const re = /^.*\/\/.*?\/(.*)$/;
    const path = re.exec(url)[1];
    console.log(`PRERENDER prerendering ${url} to ${path} in ${destination}.`);

    const page = await browser.newPage();

    await page.goto(url,{waitUntil: 'networkidle0'});

    try {
        let html = await page.content();
        // console.log('status was', status, 'redirect was', redirect, 'meta was', meta);
        // console.log('creating',`${destination}/${path.substring(0,path.lastIndexOf('/'))}`);
        fs.mkdirSync(`${destination}/${path.substring(0,path.lastIndexOf('/'))}`, {recursive: true});
        fs.writeFileSync(`${destination}/${path}`, html);
    } catch (e) {
        console.error(e);
    }

    await page.close();
    console.log('PRERENDER OF page exiting');
}

main().catch(error => console.error(error));
