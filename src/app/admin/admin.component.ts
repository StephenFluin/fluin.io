import { Component, Inject, computed } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { Post } from '../shared/post.service';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

import { FirebaseService } from './firebase.service';

export interface Talk {
    title: string;
}

@Component({
    template: `
        <div class="padded" style="margin-top: -75px" *ngIf="auth.isAdmin()">
            <h2>Administer Content (<a (click)="auth.logout()">logout</a>)</h2>

            <div style="overflow:hidden;">
                <a *ngFor="let post of posts()" [routerLink]="post.key">
                    <div style="display:flex;margin:0 16px 16px 0;">
                        <img
                            *ngIf="post.image"
                            [src]="post.image"
                            [alt]="post.title"
                            style="height:40px;margin:0px auto;display:block;max-width:50px;margin-right:16px;"
                        />
                        <div style="flex-grow:1">
                            <strong>{{ post.title }}</strong>
                        </div>
                        <div>{{ post.date }}</div>
                    </div>
                </a>
            </div>

            <div>
                <h2>New Post</h2>
                <button routerLink="new">Create</button>
            </div>
        </div>
        <div class="padded" *ngIf="!auth.isAdmin()">
            <p>You need more access.</p>
            <button (click)="auth.login()">Login</button>
        </div>
    `,
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, MatCardModule, AsyncPipe],
})
export class AdminComponent {
    list = this.firebaseService.list<Post>('/posts/');
    posts = computed(() => {
        // signal starts as null
        if (!this.list()) {
            return [];
        }
        console.log('list is currently', this.list());
        return this.list().sort((a, b) => (a.date >= b.date ? -1 : 1));
    });

    constructor(public auth: AuthService, private firebaseService: FirebaseService) {}
}
