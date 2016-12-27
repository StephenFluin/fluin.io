import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PostService } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';
import { Observable } from 'rxjs';


import * as Showdown from 'showdown';

@Component({
    template: `
  <div *ngIf="post" class="container" style="flex-grow:1;">
    <div class="columns" style="display:flex;">
        <form style="width:50%;padding:16px;" ngNoForm>
            <md-input placeholder="title" [(ngModel)]="post.title"></md-input>
            <md-input placeholder="image url" [(ngModel)]="post.image"></md-input>
            <md-input placeholder="id" [(ngModel)]="post.id"></md-input>
            <md-input placeholder="date" type="date" [(ngModel)]="post.date"></md-input>
            <textarea placeholder="body" (ngModelChange)="renderBody()" [(ngModel)]="post.body" style="height:400px;width:100%;"></textarea>
            <button type="button" (click)="save()">Save</button>
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
            <div [innerHTML]="post.renderedBody">
            </div>
        </div>
    </div>
    <div>
        <image-upload *ngIf="post.id" [folder]="'posts/'+post.id"></image-upload>
    </div>
</div>
`,
    styles: ['md-input {display:block;margin:0 0 32px 0;}'],
})
export class EditPostComponent {
    post;
    converter;

    constructor(activatedRoute: ActivatedRoute, public posts: PostService, public ep: EditablePostService, title: Title, public router: Router) {
        this.converter = new Showdown.Converter();
        activatedRoute.params.switchMap((params) => {
            let filter;
            if (!params['id']) {
                console.error("No post specified");
                return;
            } else if (params['id'] === 'new') {
                return Observable.of({});
            } else {
                // Otherwise, get specified
                filter = list => list[params['id']];
            }
            return posts.data.map(response => {
                let item = filter(response);
                title.setTitle('Edit ' + item.title + ' | fluin.io blog');


                item.renderedBody = this.converter.makeHtml(item.body);
                return item;
            })
        }).subscribe(post => {
            this.post = post;
        });

    }

    renderBody() {
        //console.log("rendering new body");
        this.post.renderedBody = this.converter.makeHtml(this.post.body);
    }

    save() {
        delete this.post.renderedBody;
        this.ep.save(this.post);
        this.router.navigateByUrl('/admin');
        this.renderBody();
    }
}
