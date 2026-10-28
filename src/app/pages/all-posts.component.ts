import { Location } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostService } from '../shared/post.service';

/** Every published post as a searchable list, at /blog */
@Component({
    selector: 'all-posts',
    template: `
        <section class="container all-posts">
            <h1>All posts</h1>
            <!-- A plain GET form, so search works before hydration and without JavaScript -->
            <form role="search" action="/blog" method="get" (submit)="$event.preventDefault()">
                <label for="post-search" class="visually-hidden">Search posts</label>
                <input
                    id="post-search"
                    type="search"
                    name="q"
                    placeholder="Search posts"
                    autocomplete="off"
                    [value]="query()"
                    (input)="search($any($event.target).value)"
                />
            </form>
            <p class="post-count" aria-live="polite">
                @if (query()) {
                    {{ matches().length }} of {{ posts().length }} posts match “{{ query() }}”
                } @else {
                    {{ posts().length }} posts
                }
            </p>
            <ol class="post-index">
                @for (post of matches(); track post.key) {
                    <li>
                        <time [attr.datetime]="post.date">{{ post.date }}</time>
                        <a [routerLink]="['/blog', post.id]">{{ post.title }}</a>
                    </li>
                }
            </ol>
        </section>
    `,
    imports: [RouterLink],
})
export class AllPostsComponent {
    private readonly location = inject(Location);
    protected readonly posts = inject(PostService).postList;

    /** The search, bound from the `q` query parameter */
    readonly q = input<string>();
    readonly query = linkedSignal(() => this.q() ?? '');

    readonly matches = computed(() => {
        const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
        return this.posts().filter((post) => {
            const title = (post.title ?? '').toLowerCase();
            return words.every((word) => title.includes(word));
        });
    });

    search(value: string) {
        this.query.set(value);
        // Keep the search in the URL so it can be shared. Replacing the URL directly (not navigating) avoids a
        // history entry, view transition, and scroll reset per keystroke.
        const q = value.trim();
        this.location.replaceState('/blog', q ? new URLSearchParams({ q }).toString() : '');
    }
}
