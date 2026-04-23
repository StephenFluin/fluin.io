import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { ActivatedRouteSnapshot, provideRouter, withPreloading, withViewTransitions } from '@angular/router';

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
        provideRouter(
            routes,
            withPreloading(SelectivePreloadStrategy),
            withViewTransitions({
                onViewTransitionCreated: ({ transition, from, to }) => {
                    // Skip animation on initial load or page refresh (no previous route).
                    if (!from) {
                        return;
                    }

                    // Skip animation if navigating to the same route (same-page link click).
                    if (from.component === to.component) {
                        return;
                    }

                    // Count total URL segments to determine navigation hierarchy depth.
                    const depth = (snap: ActivatedRouteSnapshot): number => {
                        let d = 0;
                        let s: ActivatedRouteSnapshot | null = snap;
                        while (s) { d += s.url.length; s = s.firstChild; }
                        return d;
                    };
                    const dir = depth(to) >= depth(from) ? 'forward' : 'back';
                    document.documentElement.classList.add(`route-${dir}`);
                    transition.finished.finally(() =>
                        document.documentElement.classList.remove('route-forward', 'route-back')
                    );
                },
            })
        ),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
    ],
};
