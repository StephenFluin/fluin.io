import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/map';

export interface Post {
    key: string;
    body: string;
    date: string;
    id: string;
    image: string;
    title: string;
    renderedBody?: string;
}

@Injectable()
export class PostService {
    url = 'https://fluindotio-website-93127.firebaseio.com/posts.json';
    /**
     * An object with post keys as keys, and post data as values
     */
    postMap: Observable<any>;
    /**
     * An sorted array of posts with keys directly on the object.
     */
    postList: Observable<Post[]>;

    private forceRefresher = new Subject();

    constructor(private http: Http) {
        this.postMap = this.forceRefresher.startWith(null).switchMap(() => this.http.get(this.url)
            .map(response => {
                let result = response.json();
                return result;
            }));


        // Turn an object into an array, similar to refirebase
        this.postList = this.postMap.map(data => {

            let list = [];
            for (let key of Object.keys(data)) {
                let item = data[key];
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
        }).shareReplay(1);

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
