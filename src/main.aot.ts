import { enableProdMode } from '@angular/core';
import { environment } from './app/environments/environment';
import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

if (environment.production) {
    enableProdMode();
}

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
