import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

//platformBrowserDynamic().bootstrapModule(AppModule);


import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);