import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import {
    provideRouter,
    TitleStrategy,
    withComponentInputBinding,
    withInMemoryScrolling,
    withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { SiteTitleStrategy } from './shared/site-title.strategy';
import { routeViewTransitionConfig } from './shared/view-transition.config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(
            routes,
            withComponentInputBinding(),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withViewTransitions(routeViewTransitionConfig)
        ),
        { provide: TitleStrategy, useClass: SiteTitleStrategy },
        provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
        provideHttpClient(withFetch()),
    ],
};
