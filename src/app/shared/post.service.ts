import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import "../shared/shareResults";

export interface Post {
    body: string;
    date: string;
    id: string;
    image: string;
    title: string;
}

@Injectable()
export class PostService {
    url: string = 'https://fluindotio-website-93127.firebaseio.com/posts.json';
    data: Observable<any>;
    postList: Observable<Post[]>;

    constructor(private http: Http) {
        this.data = this.http.get(this.url)
            .map(response => {

                let result = response.json() as any[];
                return result;
            }).shareResults();

        // Turn an object into an array, similar to refirebase
        this.postList = this.data.map(data => {

            let list = [];
            for (let key of Object.keys(data)) {
                let item = data[key];
                item.key = key;
                list.push(item);
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
        }).shareResults();
    }

}