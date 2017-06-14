import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { PostService, Post } from 'app/shared/post.service';

@Component({
    selector: 'post-list',
    template: `
<div id="posts-block">
    <div class="post-block" *ngFor="let post of posts | async | refirebase" [routerLink]="['blog',post.id]">
        <div class="post-image" *ngIf="!post.image" style="background-image: url('/assets/images/imgpostholder.png')"></div>
        <div class="post-image" *ngIf="post.image" [style.background-image]="'url('+post.image+')'"></div>
        <div class="post-title">
            <h2>{{post.title}}</h2>
        </div>
        <div class="post-date">
            <h3 class="date">{{post.date}}</h3>
        </div>
    </div>

</div>
`
})
export class PostListComponent {
    @Input() limit = 12;
    posts: Observable<any[]>;
    constructor(http: Http, posts: PostService) {
        this.posts = posts.postList.map(list => list.slice(0, this.limit));
    }
}