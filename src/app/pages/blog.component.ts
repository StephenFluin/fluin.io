import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { PostService } from '../shared/post.service';

@Component({
  templateUrl: './views/blog.component.html',
})
export class BlogComponent  {
  posts: Observable<any[]>;
  constructor(posts: PostService) {
      this.posts = posts.data;
  }
 }
