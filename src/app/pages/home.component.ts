import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { PostService } from '../shared/post.service';

@Component({
  templateUrl: './views/home.component.html',
})
export class HomeComponent {
  posts: Observable<any[]>;
  constructor(http: Http, posts: PostService) {
    this.posts = posts.postList.map(list => list.filter(item => new Date(item.date).getTime() <= Date.now()));
  }
}
