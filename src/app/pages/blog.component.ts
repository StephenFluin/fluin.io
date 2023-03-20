import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostService } from '../shared/post.service';

@Component({
    templateUrl: './blog.component.html',
})
export class BlogComponent {
    posts: Observable<any[]>;
    postDefaultImage: '/assets/images/imgpostholder.png';
    constructor(posts: PostService) {
        this.posts = posts.postList.pipe(map(list => list.slice(0, 5)));
    }
}
