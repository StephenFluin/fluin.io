import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { AngularFire } from 'angularfire2';

@Component({
	template: `
		<div class="container" *ngIf="auth.isAdmin | async">
			<h1>Supervision</h1>
			<ul>
				<li><a routerLink="upload">Upload a file</a></li>
			</ul>
		</div>
		<div class="container" *ngIf="!(auth.isAdmin | async)">
			<p>You need more access.</p>
			<button (click)="auth.login()">Login</button>
		</div>

		`,
		// providers: [AuthService]
})
export class AdminComponent  {
	constructor(public auth : AuthService, public af: AngularFire) {
		
	}
 }
