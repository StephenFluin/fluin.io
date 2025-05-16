import { Component, Inject, computed, inject } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { Post } from '../shared/post.service';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { FirebaseService } from './firebase.service';

export interface Talk {
    title: string;
}

@Component({
    template: `
        @if (auth.isAdmin()) {
        <p>Welcome {{ auth.name() }}, your ID is: {{ auth.uid() }}</p>
        <div class="padded" style="margin-top: -75px">
            <h2>Administer Content (<a (click)="auth.logout()">logout</a>)</h2>
            <div style="overflow:hidden;">
                @for (post of posts(); track post) {
                <a [routerLink]="post.key">
                    <div style="display:flex;margin:0 16px 16px 0;">
                        @if (post.image) {
                        <img
                            [src]="post.image"
                            [alt]="post.title"
                            style="height:40px;margin:0px auto;display:block;max-width:50px;margin-right:16px;"
                        />
                        }
                        <div style="flex-grow:1">
                            <strong>{{ post.title }}</strong>
                        </div>
                        <div>{{ post.date }}</div>
                    </div>
                </a>
                }
            </div>
            <div>
                <h2>New Post</h2>
                <button routerLink="new">Create</button>
            </div>
        </div>
        } @if (!auth.isAdmin()) {
        <div class="padded">
            <p>Welcome {{ auth.name() }}, your ID is: {{ auth.uid() }}. You are not an administrator</p>
            <p>You need more access.</p>
            <button (click)="auth.login()">Login</button>
        </div>
        }
    `,
    imports: [RouterLink, MatCardModule],
})
export class AdminComponent {
    firebaseService = inject(FirebaseService);
    list = this.firebaseService.list<Post>('/posts/');
    posts = computed(() => {
        // signal starts as null
        if (!this.list()) {
            return [];
        }
        console.log('list is currently', this.list());
        return this.list().sort((a, b) => (a.date >= b.date ? -1 : 1));
    });

    constructor(public auth: AuthService) {}
}
