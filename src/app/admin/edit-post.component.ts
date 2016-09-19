import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PostService } from '../shared/post.service';
import 'rxjs';

import * as Showdown from 'showdown';

@Component({
  template: `
  <div *ngIf="post" class="container" style="flex-grow:1;display:flex;">
    <form style="width:50%;padding:16px;" ngNoForm>
        <md-input placeholder="title" [(ngModel)]="post.title"></md-input>
        <md-input placeholder="date" type="date" [(ngModel)]="post.date"></md-input>
        <textarea placeholder="body" (ngModelChange)="renderBody()" [(ngModel)]="post.body" style="height:400px;width:100%;"></textarea>
        
    </form>
    <div style="width:50%;padding:16px;">
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
`,
    styles: ['md-input {display:block;margin:0 0 32px 0;}'],
})
export class EditPostComponent  {
    post;
    converter;

    constructor(activatedRoute : ActivatedRoute, posts: PostService, title: Title) {
        this.converter = new Showdown.Converter();
        activatedRoute.params.switchMap((params) => {
            let filter;
            if(!params['id']) {
                // If none specified, just get first
                filter = list => list[0];
            } else {
                // Otherwise, get specified
                filter = list => list.find(item => item.id === params['id']);
            }
            return posts.data.map(response => {
                let item = filter(response);
                title.setTitle( 'Edit ' + item.title + ' | fluin.io blog'); 
               
                
                item.renderedBody = this.converter.makeHtml(item.body);
                return item;
            })
        }).subscribe(post => {
            this.post = post;
        });

    }

    renderBody() {
        console.log("rendering new body");
        this.post.renderedBody = this.converter.makeHtml(this.post.body);
    }
}
