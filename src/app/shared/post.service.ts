import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { isPublished } from './post-dates';
import { parseTags, tagSlug } from './post-tags';

/** A tag and how many published posts have it */
export interface TagCount {
    name: string;
    slug: string;
    count: number;
}

export interface Post {
    /** The post's key in the realtime db. Added client-side, never stored. */
    key?: string;
    body?: string;
    date?: string;
    id?: string;
    image?: string;
    title?: string;
    /** Comma-separated, as stored. Read them with parseTags(). */
    tags?: string;
    /** HTML rendered from `body` by /api/posts/:id. Never stored. */
    renderedBody?: string;
}

@Injectable({ providedIn: 'root' })
export class PostService {
    /** Summaries of every post (no bodies), keyed by each post's key in the realtime db */
    private readonly summaries = httpResource<Record<string, Post>>(() => '/api/posts');

    /** Published posts, newest first, each with its key */
    readonly postList = computed(() => {
        const summaries = this.summaries.hasValue() ? this.summaries.value() : {};
        return Object.entries(summaries)
            .map(([key, post]): Post => ({ ...post, key }))
            .filter(isPublished)
            .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    });

    /** Every tag on a published post, most used first */
    readonly tags = computed(() => {
        const counts = new Map<string, TagCount>();
        for (const post of this.postList()) {
            for (const name of parseTags(post.tags)) {
                const slug = tagSlug(name);
                const entry = counts.get(slug) ?? { name, slug, count: 0 };
                entry.count++;
                counts.set(slug, entry);
            }
        }
        return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    });

    isFuture(post: Post) {
        return !isPublished(post);
    }
}
