import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { AuthService } from './shared/auth.service';
import { PostService } from '../shared/post.service';

@Component({
	template: `
		<div class="container" *ngIf="auth.isAdmin | async">
			<h2><span [title]="auth.uid | async">{{auth.name | async}}</span> Supervision (<a (click)="auth.logout()">logout</a>)</h2>
			<ul>
				<li><a routerLink="upload">Upload a file</a></li>
			</ul>

			<div style="overflow:hidden;">
				<a *ngFor="let post of posts | async" [routerLink]="post.$key">
					<md-card style="margin:0 16px 16px 0;width:300px;float:left;">
						<img [src]="post.image" style="height:40px;margin:0px auto;display:block;">
						<div><strong>{{post.title}}</strong></div>
						<div>{{post.date}}</div>
					</md-card>
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
					<md-input-container><input mdInput [(ngModel)]="talkName"></md-input-container>
					<image-upload [folder]="'talks/'+selectedTalk.$key"></image-upload>
				</div>
			</div>
		</div>
		<div class="container" *ngIf="(auth.isAdmin | async) == false">
			<p>You need more access.</p>
			<button (click)="auth.login()">Login</button>
		</div>
		`,
	// providers: [AuthService]
})
export class AdminComponent {
	posts;
	talkName: string;
	talkList;
	selectedTalk;

	constructor(public auth: AuthService, posts: PostService, public af: AngularFire) {
		console.log("Admin component running.");
		this.posts = af.database.list('/posts').map(
			list => (<{ date: Date }[]>list).sort((a, b) => a.date >= b.date ? -1 : 1)
		);
		this.talkList = af.database.list('/talks/');
	}
}
