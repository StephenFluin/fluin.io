import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PostService, Post } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import * as Showdown from 'showdown';
import { Subscription } from 'rxjs/Subscription';

@Component({
    template: `
  <div *ngIf="postData | async as post; else loading" class="container" style="flex-grow:1;">
    <div class="columns" style="display:flex;">
        <form style="width:50%;padding:16px;" ngNoForm>
            <md-input-container><input mdInput placeholder="title" [(ngModel)]="post.title"></md-input-container>
            <md-input-container><input mdInput placeholder="image url" [(ngModel)]="post.image"></md-input-container>
            <md-input-container><input mdInput placeholder="id" [(ngModel)]="post.id"></md-input-container>
            <md-input-container><input mdInput placeholder="date" type="date" [(ngModel)]="post.date"></md-input-container>
            <textarea placeholder="body"
                (ngModelChange)="renderBody(post)"
                [(ngModel)]="post.body"
                style="height:400px;width:100%;"></textarea>
            <button type="button" (click)="save(post)">Save</button>
        </form>
        <div style="width:50%;padding:16px;" class="post">
            <div class="highlight-image">
                <img *ngIf="!post.image" src="/assets/images/imgpostholder.png" [alt]="post.title">
                <img *ngIf="post.image" [src]="post.image" [alt]="post.title">
            </div>

            <h1>{{post.title}}</h1>
            <div>
                <h3>by Stephen Fluin</h3>
            </div>
            <div class="date">
                <h3>{{post.date}}</h3>
            </div>
            <div [innerHTML]="renderedBody">
            </div>
        </div>
    </div>
    <div>
        <image-upload *ngIf="post.id" [folder]="'posts/'+post.id"></image-upload>
    </div>
    <div>
        <h2>Delete Post</h2>
        <button (click)="delete(post)">Delete This Post</button>
    </div>
</div>
<ng-template #loading>Loading posts...</ng-template>
`,
    styles: ['md-input {display:block;margin:0 0 32px 0;}'],
})
export class EditPostComponent {
    renderedBody;
    postData: Observable<Post>;
    converter;

    constructor(
        activatedRoute: ActivatedRoute,
        public posts: PostService,
        public ep: EditablePostService,
        title: Title,
        public router: Router
    ) {
        this.converter = new Showdown.Converter();

        this.postData = activatedRoute.params.switchMap((params) => {
            let filter;
            if (!params['id']) {
                console.error('No post specified');
                return;
            } else if (params['id'] === 'new') {

                return Observable.of({});
            }

            return posts.postMap.map(postListObject => {
                console.log('Looking for post from', params, postListObject);
                console.log(postListObject);
                let item = postListObject[params['id']];
                if (item) {
                    title.setTitle('Edit ' + item.title + ' | fluin.io blog');
                    this.renderBody(item);
                }


                return item;
            })
        })

    }

    renderBody(post) {
        this.renderedBody = this.converter.makeHtml(post.body || '');
    }

    save(post) {
        this.ep.save(post);
        this.router.navigateByUrl('/admin');
    }

    delete(post) {
        this.ep.delete(post);
        this.router.navigateByUrl('/admin');
    }

}
