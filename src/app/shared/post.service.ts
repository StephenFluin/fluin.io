import { httpResource } from '@angular/common/http';
import { computed, effect, Injectable, signal, Signal, WritableSignal } from '@angular/core';

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
interface Posts {
    [key: string]: Post;
}

@Injectable({ providedIn: 'root' })
export class PostService {
    url = '/api/posts';
    /**
     * An object with post keys as keys, and post data as values
     */
    postMap = httpResource<Posts>(() => this.url);

    /**
     * An sorted array of posts with keys directly on the object.
     */
    postList: Signal<Post[]>;

    // @TODO: I temporarily removed the shareAndCache so we need to figure out how to do this with signals

    constructor() {
        // Turn the object of posts into a sorted array, with each key on its post
        this.postList = computed(() => {
            const list = [];
            if (!this.postMap.hasValue()) {
                return list;
            }
            const data = this.postMap.value();
            for (const key of Object.keys(data)) {
                const item = data[key];
                item.key = key;

                // Only include past items
                if (!this.isFuture(item)) {
                    list.push(item);
                }
            }
            list.sort((a, b) => (a.date > b.date ? -1 : 1));
            return list;
        });
    }

    isFuture(post: Post) {
        if (new Date(post.date + 'T00:00').getTime() > Date.now() || !post.date) {
            return true;
        } else {
            return false;
        }
    }
}
