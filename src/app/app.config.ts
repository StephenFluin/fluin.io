import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, Title, withEventReplay } from '@angular/platform-browser';
import { AdminService } from './shared/admin.service';
import { PostService } from './shared/post.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { SelectivePreloadStrategy } from './shared/selective-preload.strategy';

export const appConfig: ApplicationConfig = {
    providers: [
        Title,
        PostService,
        AdminService,
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes, withPreloading(SelectivePreloadStrategy)),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
    ],
};
