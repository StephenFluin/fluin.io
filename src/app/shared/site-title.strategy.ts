import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { PageHeadService } from './page-head.service';

/**
 * Uses each route's `title` and `data.description`, falling back to the site defaults. Pages without
 * a route title that know a better one (like blog posts, once their data loads) set it themselves afterwards.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);
    private readonly pageHead = inject(PageHeadService);

    override updateTitle(snapshot: RouterStateSnapshot) {
        const title = this.buildTitle(snapshot) ?? 'fluin.io';
        this.title.setTitle(title);
        this.pageHead.update({
            path: snapshot.url.split(/[?#]/)[0].replace(/\/+$/, '') || '/',
            title,
            description: deepestDescription(snapshot.root),
        });
    }
}

/** The description of the most deeply nested route that has one */
function deepestDescription(route: ActivatedRouteSnapshot): string | undefined {
    let description: string | undefined;
    for (let current: ActivatedRouteSnapshot | null = route; current; current = current.firstChild) {
        description = current.data['description'] ?? description;
    }
    return description;
}
