import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routeConfig } from './app.routes';
import { provideClientHydration, Title, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AdminService } from './shared/admin.service';
import { PostService } from './shared/post.service';

export const appConfig: ApplicationConfig = {
    providers: [
        Title,
        PostService,
        AdminService,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routeConfig),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
    ],
};
