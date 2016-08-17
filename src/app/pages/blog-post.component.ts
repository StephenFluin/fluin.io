import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import * as Showdown from 'showdown';

@Component({
  templateUrl: './views/blog-post.component.html',
})
export class BlogPostComponent  {
    post;

    constructor(activatedRoute : ActivatedRoute, http: Http) {
        activatedRoute.params.flatMap((params) => {
            console.log("Got new params!",params);
            return http.get('/posts.json').map(response => {
                console.log("got new posts!");
                let item = (response.json() as any[]).find(item => 
                    item.id === params['id']
                );
                let converter = new Showdown.Converter();
                item.body = converter.makeHtml(item.body);
                return item;
            })
        }).subscribe(post => {
            console.log("Updating post");
            this.post = post;
        });

    }
}
