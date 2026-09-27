import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { isPublished } from './post-dates';

export interface Post {
    /** The post's key in the realtime db. Added client-side, never stored. */
    key?: string;
    body?: string;
    date?: string;
    id?: string;
    image?: string;
    title?: string;
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

    isFuture(post: Post) {
        return !isPublished(post);
    }
}
