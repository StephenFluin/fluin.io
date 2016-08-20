import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
// I import everything because otherwise switchMap isn't defined
import 'rxjs/Rx';


import * as Showdown from 'showdown';

@Component({
  templateUrl: './views/blog-post.component.html',
})
export class BlogPostComponent  {
    post;

    constructor(activatedRoute : ActivatedRoute, http: Http) {
        activatedRoute.params.switchMap((params) => {
            let filter;
            if(!params['id']) {
                // If none specified, just get first
                filter = list => list[0];
            } else {
                // Otherwise, get specified
                filter = list => list.find(item => item.id === params['id']);
            }
            return http.get('/assets/posts.json').map(response => {
                let item = filter(response.json() as any[]);
                let converter = new Showdown.Converter();
                item.body = converter.makeHtml(item.body);
                return item;
            })
        }).subscribe(post => {
            this.post = post;
        });

    }
}
