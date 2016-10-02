import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

export interface Talk {
    $key: string;
    title: string;
    date: string;
    url: string;
    image: string;
}

@Injectable()
export class TalkService {
    url: string = 'https://fluindotio-website-93127.firebaseio.com/talks.json?orderByChild=date';
    data: Observable<any[]>;
    constructor(private http: Http) {
        this.data = this.http.get(this.url)
            .map(response => {
                let result = response.json() as any[];
                return result;
            }).cache(1);
    }

}