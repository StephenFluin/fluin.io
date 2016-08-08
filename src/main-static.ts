import { platformBrowser } from '@angular/platform-browser';
import { MyAppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

platformBrowser().bootstrapModuleFactory(MyAppModuleNgFactory);