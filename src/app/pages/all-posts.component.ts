import { Location } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostService } from '../shared/post.service';
import { parseTags, tagSlug } from '../shared/post-tags';

/** Every published post as a searchable list, at /blog */
@Component({
    selector: 'all-posts',
    template: `
        <section class="container all-posts">
            @if (tag()) {
                <h1>Posts about {{ activeTag()?.name ?? tag() }}</h1>
                <p class="tag-filter"><a routerLink="/blog">← All posts</a></p>
            } @else {
                <h1>All posts</h1>
            }
            <!-- A plain GET form, so search works before hydration and without JavaScript -->
            <form role="search" action="/blog" method="get" (submit)="$event.preventDefault()">
                @if (tag()) {
                    <input type="hidden" name="tag" [value]="tag()" />
                }
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
                    {{ matches().length }} of {{ tagged().length }} posts match “{{ query() }}”
                } @else {
                    {{ tagged().length }} posts
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

    private readonly tags = inject(PostService).tags;

    /** The search, bound from the `q` query parameter */
    readonly q = input<string>();
    readonly query = linkedSignal(() => this.q() ?? '');
    /** A tag's slug to show only its posts, bound from the `tag` query parameter */
    readonly tag = input<string>();
    readonly activeTag = computed(() => this.tags().find((tag) => tag.slug === this.tag()));

    readonly tagged = computed(() => {
        const slug = this.tag();
        return slug ? this.posts().filter((post) => parseTags(post.tags).some((tag) => tagSlug(tag) === slug)) : this.posts();
    });

    /** Posts whose title or tags contain every word of the search */
    readonly matches = computed(() => {
        const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
        return this.tagged().filter((post) => {
            const text = `${post.title ?? ''} ${post.tags ?? ''}`.toLowerCase();
            return words.every((word) => text.includes(word));
        });
    });

    search(value: string) {
        this.query.set(value);
        // Keep the search in the URL so it can be shared. Replacing the URL directly (not navigating) avoids a
        // history entry, view transition, and scroll reset per keystroke.
        const params = new URLSearchParams();
        if (this.tag()) {
            params.set('tag', this.tag()!);
        }
        if (value.trim()) {
            params.set('q', value.trim());
        }
        this.location.replaceState('/blog', params.toString());
    }
}
