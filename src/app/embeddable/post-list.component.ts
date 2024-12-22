import { Component, Input, Signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Post, PostService } from '../shared/post.service';

@Component({
    selector: 'post-list',
    template: `
        <div id="posts-block">
            <a class="card featured-blog-post" *ngFor="let post of posts()" [routerLink]="['blog', post.id]">
                <div
                    class="post-image"
                    *ngIf="!post.image"
                    style="background-image: url('/assets/images/imgpostholder.png')"
                ></div>
                <div
                    class="post-image"
                    *ngIf="post.image"
                    [style.background-image]="'url(\\'' + post.image + '\\')'"
                ></div>
                <div class="post-details">
                    <h4 class="post-title">
                        {{ post.title }}
                    </h4>
                    <div class="post-date">
                        {{ post.date }}
                    </div>
                </div>
            </a>
        </div>
    `,
    imports: [NgFor, RouterLink, NgIf],
})
export class PostListComponent {
    @Input() limit = 12;
    posts: Signal<Post[]>;
    constructor(posts: PostService) {
        this.posts = computed(() => posts.postList().slice(0, this.limit));
    }
}
