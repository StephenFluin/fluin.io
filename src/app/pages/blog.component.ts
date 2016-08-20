import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './views/blog.component.html',
})
export class BlogComponent  {
  posts: Observable<any[]>;
  constructor(http: Http) {
      this.posts = http.get('/assets/posts.json')
      .map(response => {
        let result = response.json() as any[];
        return result.splice(0,4);
      });
  }
 }
