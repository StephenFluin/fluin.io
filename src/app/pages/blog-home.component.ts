import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { PostService } from '../shared/post.service';

@Component({
  templateUrl: './views/blog-home.component.html',
})
export class BlogHomeComponent {
  constructor(activatedRoute: ActivatedRoute, posts: PostService, router: Router) {
    posts.data.subscribe(id => {
      console.log('got ', id);
      router.navigate(['blog', id]);
    });
  }

}
