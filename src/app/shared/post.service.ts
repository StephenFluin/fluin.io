import { httpResource } from '@angular/common/http';
import { computed, effect, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

export class Post {
    key: string;
    body?: string;
    date?: string;
    id?: string;
    image?: string;
    title?: string;
    renderedBody?: SafeHtml;
    constructor() {
        this.key = '';
    }
}
interface Posts {
    [key: string]: Post;
}

@Injectable({ providedIn: 'root' })
export class PostService {
    url = 'https://fluindotio-website-93127.firebaseio.com/posts.json';
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
        // Turn an object into an array, similar to refirebase
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
    refreshData() {
        this.postMap.reload();
    }

    isFuture(post: Post) {
        if (new Date(post.date + 'T00:00').getTime() > Date.now() || !post.date) {
            return true;
        } else {
            return false;
        }
    }
}
