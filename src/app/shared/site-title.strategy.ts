import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Uses each route's `title`, falling back to the site name. Pages without a route title that know
 * a better one (like blog posts, once their data loads) set it themselves afterwards.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);

    override updateTitle(snapshot: RouterStateSnapshot) {
        this.title.setTitle(this.buildTitle(snapshot) ?? 'fluin.io');
    }
}
