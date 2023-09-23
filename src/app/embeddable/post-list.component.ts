import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostService } from 'app/shared/post.service';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'post-list',
    template: `
        <div id="posts-block">
            <a class="card featured-blog-post" *ngFor="let post of posts | async" [routerLink]="['blog', post.id]">
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
    standalone: true,
    imports: [NgFor, RouterLink, NgIf, AsyncPipe],
})
export class PostListComponent {
    @Input() limit = 12;
    posts: Observable<any[]>;
    constructor(posts: PostService) {
        this.posts = posts.postList.pipe(map((list) => list.slice(0, this.limit)));
    }
}
