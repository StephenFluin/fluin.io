import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { PostService } from '../shared/post.service';

@Component({
	template: `
		<div class="container" *ngIf="auth.isAdmin | async">
			<h1>{{auth.name | async}} Supervision (<a (click)="auth.logout()">logout</a>)</h1>
			<ul>
				<li><a routerLink="upload">Upload a file</a></li>
			</ul>

			<div style="overflow:hidden;">
				<md-card *ngFor="let post of posts | async" style="margin:0 16px 16px 0;width:300px;float:left;" [routerLink]="post.id">
					<img [src]="post.image" style="height:40px;margin:0px auto;display:block;">
					<div><strong>{{post.title}}</strong></div>
					<div>{{post.date}}</div>
				</md-card>
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
