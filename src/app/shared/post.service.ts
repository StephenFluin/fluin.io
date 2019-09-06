import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from 'rxjs';
import { shareReplay, startWith, map, switchMap } from 'rxjs/operators';
import { SafeHtml } from '@angular/platform-browser';

import { shareAndCache } from 'http-operators';

export class PostBrief {
    date: string;
    image: string;
    title: string;
}

export class Post extends PostBrief {
    key: string;
    body?: string;
    id?: string;
    renderedBody?: SafeHtml;
    constructor() {
        super();
        this.key = '';
    }
}



@Injectable()
export class PostService {
    url = 'https://fluindotio-website-93127.firebaseio.com/posts.json';
    /**
     * An object with post keys as keys, and post data as values
     */
    postMap: Observable<{ [key: string]: Post }>;
    /**
     * An sorted array of posts with keys directly on the object.
     */
    postList: Observable<Post[]>;

    postBrief: Observable<PostBrief[]> = this.http.get<PostBrief[]>('/api/postList');

    private forceRefresher = new Subject();

    constructor(private http: HttpClient) {
        this.postMap = this.forceRefresher.pipe(
            startWith(null),
            switchMap(() => this.http.get<any>(this.url)),
            shareAndCache('fluinPostCache'),
        );

        // Turn an object into an array, similar to refirebase
        this.postList = this.postMap.pipe(
            map(data => {
                const list = [];
                for (const key of Object.keys(data)) {
                    const item = data[key];
                    item.key = key;

                    // Only include past items
                    if (!this.isFuture(item)) {
                        list.push(item);
                    }
                }
                list.sort((a, b) => {
                    if (a.date > b.date) {
                        return -1;
                    } else if (b.date > a.date) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return list;
            }),
            shareReplay(1)
        );
    }
    refreshData() {
        this.forceRefresher.next();
    }

    isFuture(post: Post) {
        if (new Date(post.date + 'T00:00').getTime() > Date.now() || !post.date) {
            return true;
        } else {
            return false;
        }
    }
}
