import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from '@angular/core';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Post } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';
import { FirebaseService } from './firebase.service';

import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import markdownit from 'markdown-it';

import { UploadComponent } from './upload.component';

@Component({
    templateUrl: './edit-post.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, RouterLink, UploadComponent],
})
export class EditPostComponent {
    private ep = inject(EditablePostService);
    private firebaseService = inject(FirebaseService);
    private router = inject(Router);
    private sanitized = inject(DomSanitizer);

    /**
     * The slug the post is stored under (from the route), or 'new'
     */
    savedId = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
        initialValue: '',
    });

    /**
     * Data coming from the server. Read straight from the realtime db (not the cached public API)
     * so the editor always has the full, current post.
     */
    postResource = resource({
        params: () => this.savedId(),
        loader: ({ params: id }) =>
            id === 'new' ? Promise.resolve<Post>({}) : this.firebaseService.getOnce<Post>(`/posts/${id}`),
    });
    postData = computed(() => this.postResource.value());

    /**
     * Data coming from the user
     */
    postChanges = new Subject<Post>();
    postPreview = toSignal(
        this.postChanges.pipe(
            debounceTime(300),
            map((post): SafeHtml => {
                const result = markdownit().render(post.body || '');
                return this.sanitized.bypassSecurityTrustHtml(result);
            })
        )
    );

    /** Feedback about the last save or delete */
    status = signal('');

    constructor() {
        const title = inject(Title);
        effect(() => {
            const post = this.postData();
            if (post) {
                title.setTitle(this.savedId() === 'new' ? 'New post | fluin.io blog' : `Edit ${post.title} | fluin.io blog`);
                this.contentChange(post);
            }
        });
    }

    contentChange(post: Post) {
        this.postChanges.next(post);
    }

    /**
     * @param leave Go back to the admin list after a successful save
     */
    async save(post: Post, leave: boolean) {
        this.status.set('Saving...');
        try {
            await this.ep.save(post, this.savedId());
        } catch (error) {
            this.status.set(`Not saved: ${error instanceof Error ? error.message : error}`);
            return;
        }
        this.status.set(`Saved at ${new Date().toLocaleTimeString()}`);

        if (leave) {
            this.router.navigateByUrl('/admin');
        } else if (post.id !== this.savedId()) {
            // Keep editing at the post's new URL so the next save updates it instead of creating another
            this.router.navigate(['/admin', post.id], { replaceUrl: true });
        }
    }

    onKey(event: KeyboardEvent, post: Post) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.save(post, false);
        }
    }

    async delete() {
        try {
            if (await this.ep.delete(this.savedId())) {
                this.router.navigateByUrl('/admin');
            }
        } catch (error) {
            this.status.set(`Not deleted: ${error instanceof Error ? error.message : error}`);
        }
    }
}
