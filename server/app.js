"use strict";
exports.__esModule = true;
// These are important and needed before anything else
require("zone.js/dist/zone-node");
require("reflect-metadata");
var core_1 = require("@angular/core");
var express = require("express");
// Faster server renders w/ Prod mode (dev mode never needed)
core_1.enableProdMode();
// Express server
var app = express();
var PORT = process.env.PORT || 4000;
// * NOTE :: leave this as require() since this file is built Dynamically from webpack
var main_1 = require("./dist/main");
// Express Engine
var express_engine_1 = require("@nguniversal/express-engine");
// Import module map for lazy loading
var module_map_ngfactory_loader_1 = require("@nguniversal/module-map-ngfactory-loader");
app.engine('html', express_engine_1.ngExpressEngine({
    bootstrap: main_1.AppServerModuleNgFactory,
    providers: [
        module_map_ngfactory_loader_1.provideModuleMap(main_1.LAZY_MODULE_MAP)
    ]
}));
app.set('view engine', 'html');
app.set('views', 'client');
// TODO: implement data requests securely
app.get('/api/*', function (req, res) {
    res.status(404).send('data requests are not supported');
});
// Server static files from /browser
app.get('*.*', express.static('client'));
// All regular routes use the Universal engine
app.get('*', function (req, res) {
    res.render('index', { req: req });
});
// Start up the Node server
app.listen(PORT, function () {
    console.log("Node server listening on http://localhost:" + PORT);
});
