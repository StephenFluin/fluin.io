import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isValidLinkTarget, QuickLink, slugProblem } from '../shared/quick-links';
import { FirebaseService } from './firebase.service';

/** Manage short redirects like fluin.io/meet, stored in the realtime db at links/{slug} */
@Component({
    template: `
        <div class="admin-page links">
            <header class="toolbar">
                <a routerLink="..">← Posts</a>
                <h1>Quick links</h1>
            </header>
            <p class="muted">fluin.io/<em>slug</em> redirects to the URL. Changes take effect within a minute.</p>

            <form class="link-form" (submit)="add($event)">
                <h2>New link</h2>
                <div class="fields">
                    <label>
                        Slug
                        <span class="slug-input">
                            <span class="muted" aria-hidden="true">fluin.io/</span>
                            <input
                                #slugInput
                                [value]="newSlug()"
                                (input)="newSlug.set(slugInput.value.trim().toLowerCase())"
                                placeholder="meet"
                                autocomplete="off"
                                aria-describedby="new-link-error"
                            />
                        </span>
                    </label>
                    <label>
                        URL
                        <input
                            #urlInput
                            type="url"
                            [value]="newUrl()"
                            (input)="newUrl.set(urlInput.value.trim())"
                            placeholder="https://calendly.com/..."
                            autocomplete="off"
                            aria-describedby="new-link-error"
                        />
                    </label>
                    <button type="submit" class="button primary" [disabled]="!newSlug() || !newUrl()">Add link</button>
                </div>
                <p id="new-link-error" class="error" role="alert">{{ error() }}</p>
            </form>

            @if (list() === null) {
                <p class="muted">Loading links...</p>
            } @else {
                <ul class="link-list">
                    @for (link of sortedLinks(); track link.key) {
                        <li>
                            <a class="slug" [href]="'/' + link.key" target="_blank" rel="noopener">/{{ link.key }}</a>
                            @if (editing() === link.key) {
                                <label class="visually-hidden" [for]="'url-' + link.key">URL for /{{ link.key }}</label>
                                <input
                                    #editInput
                                    [id]="'url-' + link.key"
                                    type="url"
                                    [value]="link.url"
                                    (keydown.enter)="save(link.key, editInput.value)"
                                    (keydown.escape)="editing.set(null)"
                                />
                                <button type="button" class="button small primary" (click)="save(link.key, editInput.value)">
                                    Save
                                </button>
                                <button type="button" class="button small" (click)="editing.set(null)">Cancel</button>
                            } @else {
                                <span class="url">{{ link.url }}</span>
                                <button type="button" class="button small" (click)="edit(link.key)">
                                    Edit<span class="visually-hidden"> /{{ link.key }}</span>
                                </button>
                                <button type="button" class="button small danger" (click)="remove(link.key)">
                                    Delete<span class="visually-hidden"> /{{ link.key }}</span>
                                </button>
                            }
                        </li>
                    } @empty {
                        <li class="muted">No quick links yet.</li>
                    }
                </ul>
            }
        </div>
    `,
    styles: `
        .links {
            max-width: 1100px;
        }
        .toolbar {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .toolbar h1 {
            font-size: 32px;
        }
        .link-form {
            margin: 24px 0;
            padding: 16px;
            border: 1px solid #eee;
            border-radius: 8px;
        }
        .link-form h2 {
            margin: 0 0 12px;
            font-size: 18px;
        }
        .fields {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            gap: 12px 16px;
        }
        .fields label {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-weight: bold;
            font-size: 14px;
        }
        .fields label:nth-child(2) {
            flex-grow: 1;
        }
        .slug-input {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        input {
            padding: 8px 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font: inherit;
            font-weight: normal;
            min-width: 0;
        }
        .error {
            margin: 8px 0 0;
            color: #b42318;
            font-size: 14px;
        }
        .error:empty {
            display: none;
        }
        .link-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .link-list li {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px 12px;
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
        }
        .slug {
            font-weight: bold;
            min-width: 120px;
        }
        .url,
        .link-list input {
            flex: 1 1 240px;
            overflow-wrap: anywhere;
        }
    `,
    imports: [RouterLink],
})
export class QuickLinksComponent {
    private firebaseService = inject(FirebaseService);

    list = this.firebaseService.list<QuickLink>('/links/');
    sortedLinks = computed(() => [...(this.list() ?? [])].sort((a, b) => a.key.localeCompare(b.key)));

    newSlug = signal('');
    newUrl = signal('');
    error = signal('');
    /** Slug of the link whose URL is being edited */
    editing = signal<string | null>(null);

    async add(event: Event) {
        event.preventDefault();
        const slug = this.newSlug();
        const url = this.newUrl();

        const problem =
            slugProblem(slug) ??
            (this.list()?.some((link) => link.key === slug) ? `/${slug} already exists. Edit it below.` : null) ??
            (isValidLinkTarget(url) ? null : 'Enter a full URL starting with https://');
        this.error.set(problem ?? '');
        if (problem) {
            return;
        }

        await this.firebaseService.set<QuickLink>(`/links/${slug}`, { url });
        this.newSlug.set('');
        this.newUrl.set('');
    }

    edit(slug: string) {
        this.editing.set(slug);
        // Move focus into the field that replaces the Edit button
        setTimeout(() => document.getElementById(`url-${slug}`)?.focus());
    }

    async save(slug: string, url: string) {
        url = url.trim();
        if (!isValidLinkTarget(url)) {
            alert('Enter a full URL starting with https://');
            return;
        }
        await this.firebaseService.update(`/links/${slug}`, { url });
        this.editing.set(null);
    }

    async remove(slug: string) {
        if (confirm(`Delete fluin.io/${slug}? Anyone using it will get a "page not found".`)) {
            await this.firebaseService.remove(`/links/${slug}`);
        }
    }
}
