import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';

@Component({
	template: `
		<div class="container" *ngIf="auth.isAdmin | async">
			<h1>Supervision</h1>
		</div>
		<div class="container" *ngIf="!(auth.isAdmin | async)">
			<p>You need more access.</p>
		</div>

		`,
		// providers: [AuthService]
})
export class AdminComponent  {
	constructor(public auth : AuthService) {

	}
 }
