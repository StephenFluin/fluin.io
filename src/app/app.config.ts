import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideCheckNoChangesConfig,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, Title, withEventReplay, withNoHttpTransferCache } from '@angular/platform-browser';
import { AdminService } from './shared/admin.service';
import { PostService } from './shared/post.service';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
    providers: [
        Title,
        PostService,
        AdminService,
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideCheckNoChangesConfig({ exhaustive: true, interval: 1000 }),
        provideRouter(routes),
        provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
        provideHttpClient(withFetch()),
    ],
};
