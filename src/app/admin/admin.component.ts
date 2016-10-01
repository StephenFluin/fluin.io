import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { PostService } from '../shared/post.service';

@Component({
	template: `
		<div class="container" *ngIf="auth.isAdmin | async">
			<h1><span [title]="auth.uid | async">{{auth.name | async}}</span> Supervision (<a (click)="auth.logout()">logout</a>)</h1>
			<ul>
				<li><a routerLink="upload">Upload a file</a></li>
			</ul>

			<div style="overflow:hidden;">
				<a *ngFor="let post of posts | async | refirebase" [routerLink]="post.$key">
					<md-card style="margin:0 16px 16px 0;width:300px;float:left;">
						<img [src]="post.image" style="height:40px;margin:0px auto;display:block;">
						<div><strong>{{post.title}}</strong></div>
						<div>{{post.date}}</div>
					</md-card>
				</a>
			</div>
		</div>
		<div class="container" *ngIf="!(auth.isAdmin | async)">
			<p>You need more access.</p>
			<button (click)="auth.login()">Login</button>
		</div>
		`,
		// providers: [AuthService]
})
export class AdminComponent  {
	posts;
	constructor(public auth : AuthService, posts: PostService) {
		this.posts = posts.data;
	}
 }
