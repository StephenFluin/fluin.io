import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';

import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { routeConfig } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { AdminService } from './app/shared/admin.service';
import { PostService } from './app/shared/post.service';
import { Title, BrowserModule, bootstrapApplication, provideClientHydration } from '@angular/platform-browser';

if (environment.production) {
    enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrapApplication(AppComponent, {
        providers: [
            provideClientHydration(),
            importProvidersFrom(BrowserModule.withServerTransition({ appId: 'serverApp' })),
            Title,
            PostService,
            AdminService,
            provideRouter(routeConfig),
            provideHttpClient(withInterceptorsFromDi()),
            provideAnimations(),
        ],
    });
});
