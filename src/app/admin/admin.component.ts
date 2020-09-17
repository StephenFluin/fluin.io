import { Component } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { map } from 'rxjs/operators';
import { Post } from '../shared/post.service';
import { keyify } from './shared/keyify.operator';

export interface Talk {
    title: string;
}

@Component({
    template: `
        <div class="padded" *ngIf="auth.isAdmin | async">
            <h2><span [title]="auth.uid | async">{{auth.name | async}}</span> Supervision (<a (click)="auth.logout()">logout</a>)</h2>
            <ul>
                <li><a routerLink="upload">Upload a file</a></li>
            </ul>

            <div style="overflow:hidden;">
                <a *ngFor="let post of posts | async" [routerLink]="post.key">
                    <mat-card style="margin:0 16px 16px 0;width:300px;height:125px;float:left;">
                        <img *ngIf="post.image" [src]="post.image" [alt]="post.title" style="height:40px;margin:0px auto;display:block;">
                        <div><strong>{{post.title}}</strong></div>
                        <div>{{post.date}}</div>
                    </mat-card>
                </a>
            </div>

            <div>
                <h2>New Post</h2>
                <button routerLink="new">Create</button>
            </div>


            <div>
                <h2>Manage Talks</h2>
                <select [(ngModel)]="selectedTalk">
                    <option *ngFor="let talk of talkList | async" [ngValue]="talk">{{talk.title}}</option>
                </select>
                <div *ngIf="selectedTalk">
                    <h3>Talk Image Upload</h3>
                    <mat-form-field><input matInput [(ngModel)]="talkName"></mat-form-field>
                    <image-upload [folder]="'talks/'+selectedTalk.key"></image-upload>
                </div>
            </div>
        </div>
        <div class="padded" *ngIf="(auth.isAdmin | async) == false">
            <p>You need more access.</p>
            <button (click)="auth.login()">Login</button>
        </div>
        `,
})
export class AdminComponent {
    posts = this.db
        .list<Post>('/posts')
        .snapshotChanges()
        .pipe(
            keyify,
            map(list => list.sort((a, b) => (a.date >= b.date ? -1 : 1)))
        );

    talkName: string;
    talkList = this.db
        .list<Talk>('/talks/')
        .snapshotChanges()
        .pipe(keyify);

    selectedTalk;

    constructor(public auth: AuthService, public db: AngularFireDatabase) {}
}
