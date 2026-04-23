import {
    ApplicationConfig,
    inject,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { provideClientHydration, Title, withEventReplay } from '@angular/platform-browser';
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
        provideRouter(
            routes,
            withViewTransitions({
                // Guards cleanup so an older transition cannot clear state for a newer one.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onViewTransitionCreated: (() => {
                    const routePath = (snap: ActivatedRouteSnapshot | undefined): string => {
                        if (!snap) {
                            return '';
                        }
                        const parts: string[] = [];
                        let s: ActivatedRouteSnapshot | null = snap;
                        while (s) {
                            for (const seg of s.url) {
                                parts.push(seg.path);
                            }
                            s = s.firstChild;
                        }
                        return `/${parts.join('/')}`;
                    };

                    const routeDepth = (snap: ActivatedRouteSnapshot): number => {
                        let d = 0;
                        let s: ActivatedRouteSnapshot | null = snap;
                        while (s) {
                            d += s.url.length;
                            s = s.firstChild;
                        }
                        return d;
                    };

                    return ({ from, to }: { from: ActivatedRouteSnapshot | undefined; to: ActivatedRouteSnapshot; }) => {
                        const router = inject(Router);
                        const fromPath = routePath(from);
                        const toPath = routePath(to);

                        // Skip all first-load transitions, including hard refresh on deep links.
                        // `from` may still be defined during initial navigation, so rely on router state.
                        const nav = router.getCurrentNavigation();
                        const isInitialNavigation = !router.navigated || !nav?.previousNavigation;
                        if (isInitialNavigation) {
                            return;
                        }

                        // Initial load / hard refresh: no previous route.
                        if (!from) {
                            return;
                        }

                        // Same effective route (including fragment/query-only nav): no slide.
                        if (fromPath === toPath) {
                            return;
                        }

                        const fromDepth = routeDepth(from);
                        const toDepth = routeDepth(to);
                        const dir = toDepth >= fromDepth ? 'forward' : 'back';

                        // Keep the current direction on root; it is overwritten on each navigation.
                        // Avoiding async cleanup prevents race conditions between consecutive transitions.
                        document.documentElement.setAttribute('data-view-transition-type', dir);
                    };
                })(),
            })
        ),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
    ],
};
