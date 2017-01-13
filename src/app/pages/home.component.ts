import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { PostService } from '../shared/post.service';

import "rxjs/add/operator/map";

@Component({
  templateUrl: './views/home.component.html',
})
export class HomeComponent {
  posts: Observable<any[]>;
  constructor(http: Http, posts: PostService) {
    this.posts = posts.postList.map(list => list.slice(0,12));
  }
}
