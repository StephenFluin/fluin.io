import { Component, Signal, computed } from '@angular/core';
import { Post, PostService } from '../shared/post.service';
import { NgFor, NgIf, AsyncPipe, JsonPipe } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
    templateUrl: './blog.component.html',
    standalone: true,
    imports: [RouterOutlet, NgFor, RouterLink, NgIf, AsyncPipe],
})
export class BlogComponent {
    posts: Signal<Post[]>;
    postDefaultImage: 'zzzz.png';
    constructor(posts: PostService) {
        this.posts = computed(() => posts.postList().slice(0, 5));
    }
}
