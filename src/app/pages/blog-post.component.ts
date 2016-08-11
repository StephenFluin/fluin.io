import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './views/blog-post.component.html',
})
export class BlogPostComponent  {
    post;

    constructor(activatedRoute : ActivatedRoute, http: Http) {
        activatedRoute.params.flatMap((params) => {
            return http.get('/posts.json').map(response => {
                return (response.json() as any[]).find(item => 
                    item.id === params['id']
                ) 
            })
        }).subscribe(post => this.post = post);
    }
}
