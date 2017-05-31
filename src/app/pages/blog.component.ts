import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { PostService } from '../shared/post.service';

@Component({
    templateUrl: './blog.component.html',
})
export class BlogComponent {
    posts: Observable<any[]>;
    constructor(posts: PostService) {
        this.posts = posts.postList.map(list => list.slice(0,5));
    }
}
