import { Component, RESPONSE_INIT, afterNextRender, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { PostService } from './shared/post.service';

/**
 * Shown for unknown routes and missing posts. When server rendered, it also sets the 404 status.
 */
@Component({
    selector: 'not-found',
    template: `
        <section class="container not-found">
            <h1>Page not found</h1>
            <p>There's nothing at <code>{{ path }}</code>. It may have moved, or the link may have a typo.</p>
            <!-- A plain GET form to the post list, so it works before hydration too -->
            <form class="not-found-search" role="search" action="/blog" method="get">
                <label for="not-found-search" class="visually-hidden">Search posts</label>
                <input id="not-found-search" type="search" name="q" placeholder="Search posts" [value]="guess" />
                <button type="submit">Search</button>
            </form>
            <p>Or head to the <a routerLink="/">home page</a>, <a routerLink="/blog">all posts</a>, or <a routerLink="/projects">projects</a>.</p>
            @if (recent().length) {
                <h2>Recent posts</h2>
                <ol class="post-index">
                    @for (post of recent(); track post.key) {
                        <li>
                            <time [attr.datetime]="post.date">{{ post.date }}</time>
                            <a [routerLink]="['/blog', post.id]">{{ post.title }}</a>
                        </li>
                    }
                </ol>
            }
        </section>
    `,
    imports: [RouterLink],
})
export class NotFoundComponent {
    private readonly postList = inject(PostService).postList;
    readonly recent = computed(() => this.postList().slice(0, 5));

    readonly path = inject(Router).url.split(/[?#]/)[0];
    /** The last part of the path as words (e.g. "state of ssr" for /blog/state-of-ssr), to start a search with */
    readonly guess = safeDecode(this.path.split('/').filter(Boolean).pop() ?? '')
        .replace(/[-_+]+/g, ' ')
        .trim();

    constructor() {
        const meta = inject(Meta);
        const title = inject(Title);
        const markNotFound = () => {
            title.setTitle('Page not found | fluin.io');
            meta.updateTag({ name: 'robots', content: 'noindex' });
        };
        markNotFound();
        // In the browser this can be created before the navigation ends (e.g. a missing post whose 404 was
        // transferred from the server), and the router then sets the route's title and clears robots. Redo it.
        afterNextRender(markNotFound);

        const responseInit = inject(RESPONSE_INIT, { optional: true });
        if (responseInit) {
            responseInit.status = 404;
        }
    }
}

function safeDecode(segment: string) {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}
