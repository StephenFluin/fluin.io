import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, ViewTransitionInfo } from '@angular/router';

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
    onViewTransitionCreated: ({ transition, from, to }: ViewTransitionInfo) => {
        const router = inject(Router);
        const root = document.documentElement;

        // Skip all first-load transitions, including hard refresh on deep links.
        // `from` may still be defined during initial navigation, so rely on router state.
        const nav = router.getCurrentNavigation();
        const isInitialNavigation = !router.navigated || !nav?.previousNavigation;
        if (isInitialNavigation || !from) {
            return;
        }

        // The slide shows moving up or down the content hierarchy. Moves that stay at the same depth
        // (older/newer post, tag to tag, query-only changes) aren't up or down, so they happen instantly.
        // Clear the direction too, so a previous slide never replays.
        const fromDepth = routeDepth(from);
        const toDepth = routeDepth(to);
        if (fromDepth === toDepth) {
            root.removeAttribute('data-view-transition-type');
            transition.skipTransition();
            return;
        }

        // Keep direction on root and overwrite it on each navigation.
        root.setAttribute('data-view-transition-type', toDepth > fromDepth ? 'forward' : 'back');
    },
};
