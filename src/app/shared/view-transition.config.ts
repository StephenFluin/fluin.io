import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

const routePath = (snap: ActivatedRouteSnapshot | undefined): string => {
    if (!snap) {
        return '';
    }

    const parts: string[] = [];
    let current: ActivatedRouteSnapshot | null = snap;
    while (current) {
        for (const seg of current.url) {
            parts.push(seg.path);
        }
        current = current.firstChild;
    }

    return `/${parts.join('/')}`;
};

const routeDepth = (snap: ActivatedRouteSnapshot): number => {
    let depth = 0;
    let current: ActivatedRouteSnapshot | null = snap;
    while (current) {
        depth += current.url.length;
        current = current.firstChild;
    }
    return depth;
};

export const routeViewTransitionConfig = {
    onViewTransitionCreated: ({ from, to }: { from: ActivatedRouteSnapshot | undefined; to: ActivatedRouteSnapshot; }) => {
        const router = inject(Router);

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
        const fromPath = routePath(from);
        const toPath = routePath(to);
        if (fromPath === toPath) {
            return;
        }

        const fromDepth = routeDepth(from);
        const toDepth = routeDepth(to);
        const dir = toDepth >= fromDepth ? 'forward' : 'back';

        // Keep direction on root and overwrite it on each navigation.
        document.documentElement.setAttribute('data-view-transition-type', dir);
    },
};
