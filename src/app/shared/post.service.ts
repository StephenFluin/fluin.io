import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

const url: string = 'https://fluindotio-website-93127.firebaseio.com/posts.json?orderByChild=date';

@Injectable()
export class PostService {
    data: Observable<{body:string,date:string,id:string,image:string,title:string}[]>;
    constructor(private http: Http) {
        this.data = this.http.get(url)
        .map(response => {
            let result = response.json() as any[];
                return result;
        }).cache(1);
    }
}