import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

export interface Post {
    body: string;
    date: string;
    id: string;
    image: string;
    title: string;
}

@Injectable()
export class PostService {
    url: string = 'https://fluindotio-website-93127.firebaseio.com/posts.json?orderBy=%22date%22&limitToLast=4';
    data: Observable<Post[]>;
    constructor(private http: Http) {
        this.data = this.http.get(this.url)
            .map(response => {
                let result = response.json() as any[];
                return result;
            }).cache(1);
    }

}