"use strict";
// import * as angularUniversal from 'angular-universal-express-firebase';
Object.defineProperty(exports, "__esModule", { value: true });
// export let ssrapp = angularUniversal.trigger({
//     index: __dirname + '/index.html',
//     main: __dirname + '/dist-server/main.bundle',
//     enableProdMode: true,
//     cdnCacheExpiry: 1200,
//     browserCacheExpiry: 600
// });
require("zone.js/dist/zone-node");
const functions = require("firebase-functions");
const express = require("express");
const platform_server_1 = require("@angular/platform-server");
const fs = require("fs");
const document = fs.readFileSync(__dirname + '/index.html', 'utf8');
const AppServerModuleNgFactory = require(__dirname + '/dist-server/main.bundle');
const app = express();
app.get('**', (req, res) => {
    console.log("Generating page for ", req.path);
    const url = req.path;
    platform_server_1.renderModuleFactory(AppServerModuleNgFactory, { document, url })
        .then(html => {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
        res.send(html);
    });
});
exports.ssrapp = functions.https.onRequest(app);
