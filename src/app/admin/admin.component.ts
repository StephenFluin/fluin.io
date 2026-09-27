import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { Post, PostService } from '../shared/post.service';
import { buildOptimizedImageUrl, IMAGE_QUALITY } from '../shared/image-url';
import { RouterLink } from '@angular/router';

import { FirebaseService } from './firebase.service';

@Component({
    template: `
        <div class="admin-page admin">
            @if (!firebaseService.authReady()) {
                <p class="muted">Checking sign-in...</p>
            } @else if (auth.isAdmin()) {
                <header class="toolbar">
                    <h1>Posts</h1>
                    <a class="button primary" routerLink="new">New post</a>
                    <span class="spacer"></span>
                    <span class="muted">Signed in as {{ auth.name() }}</span>
                    <button type="button" class="button" (click)="auth.logout()">Log out</button>
                </header>

                <div class="search">
                    <label for="post-search" class="visually-hidden">Search posts</label>
                    <input
                        #search
                        id="post-search"
                        type="search"
                        placeholder="Search by title, slug, or date"
                        autocomplete="off"
                        [value]="query()"
                        (input)="query.set(search.value)"
                    />
                    <span class="muted" aria-live="polite">
                        @if (query()) { {{ filteredPosts().length }} of } {{ sortedPosts().length }} posts
                    </span>
                </div>

                @if (list() === null) {
                    <p class="muted">Loading posts...</p>
                } @else {
                    <ul class="post-list">
                        @for (post of filteredPosts(); track post.key) {
                            <li>
                                <a class="post-row" [routerLink]="post.key">
                                    @if (post.image) {
                                        <img [src]="thumbnail(post)" alt="" width="48" height="48" loading="lazy" />
                                    } @else {
                                        <span class="no-image" aria-hidden="true"></span>
                                    }
                                    <span class="row-text">
                                        <span class="row-title">{{ post.title || '(untitled)' }}</span>
                                        <span class="muted">/{{ post.key }}</span>
                                    </span>
                                    @if (postService.isFuture(post)) {
                                        <span class="badge">Unpublished</span>
                                    }
                                    <span class="row-date muted">{{ post.date || 'No date' }}</span>
                                </a>
                            </li>
                        } @empty {
                            <li class="muted">No posts match "{{ query() }}".</li>
                        }
                    </ul>
                }
            } @else {
                <h1>Admin</h1>
                @if (auth.uid()) {
                    <p>Signed in as {{ auth.name() }} ({{ auth.uid() }}), which isn't an administrator account.</p>
                    <button type="button" class="button" (click)="auth.logout()">Log out</button>
                } @else {
                    <p>Sign in to manage posts.</p>
                    <button type="button" class="button primary" (click)="auth.login()">Sign in with Google</button>
                }
            }
        </div>
    `,
    styles: `
        .admin {
            max-width: 1100px;
        }
        .toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px 16px;
        }
        .toolbar h1 {
            font-size: 32px;
        }
        .search {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 24px 0 8px;
        }
        .search input {
            flex-grow: 1;
            max-width: 480px;
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font: inherit;
        }
        .post-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .post-list li {
            border-bottom: 1px solid #eee;
        }
        .post-list li.muted {
            padding: 16px 0;
        }
        .post-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 10px 8px;
            color: var(--text-color);
            font-weight: normal;
            opacity: 1;
        }
        .post-row:hover,
        .post-row:focus-visible {
            background: #f4f7f9;
        }
        .post-row img,
        .no-image {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: 4px;
            object-fit: cover;
            background: #eee;
        }
        .row-text {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            min-width: 0;
        }
        .row-title {
            color: var(--link-color);
            font-weight: bold;
            overflow-wrap: anywhere;
        }
        .row-text .muted {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .badge {
            flex-shrink: 0;
            padding: 2px 8px;
            border-radius: 999px;
            background: #fff3cd;
            color: #664d03;
            font-size: 12px;
            font-weight: bold;
        }
        .row-date {
            flex-shrink: 0;
            font-variant-numeric: tabular-nums;
        }
        @media (max-width: 600px) {
            .row-date {
                display: none;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink],
})
export class AdminComponent {
    auth = inject(AuthService);
    firebaseService = inject(FirebaseService);
    postService = inject(PostService);

    list = this.firebaseService.list<Post>('/posts/');
    query = signal('');

    /** All posts, newest first, with undated drafts at the top */
    sortedPosts = computed(() =>
        [...(this.list() ?? [])].sort((a, b) => (b.date || '9999').localeCompare(a.date || '9999'))
    );

    filteredPosts = computed(() => {
        const terms = this.query().toLowerCase().split(/\s+/).filter(Boolean);
        return this.sortedPosts().filter((post) => {
            const text = `${post.title} ${post.key} ${post.date}`.toLowerCase();
            return terms.every((term) => text.includes(term));
        });
    });

    thumbnail(post: Post) {
        return buildOptimizedImageUrl(post.image, { width: 96, height: 96, fit: 'cover', quality: IMAGE_QUALITY.card });
    }
}
