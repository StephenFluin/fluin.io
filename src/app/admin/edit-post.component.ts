import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    computed,
    effect,
    inject,
    resource,
    signal,
    viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
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
    styleUrl: './edit-post.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, RouterLink, UploadComponent],
    host: {
        '(window:beforeunload)': 'onBeforeUnload($event)',
    },
})
export class EditPostComponent {
    private ep = inject(EditablePostService);
    private firebaseService = inject(FirebaseService);
    private router = inject(Router);

    bodyInput = viewChild<ElementRef<HTMLTextAreaElement>>('bodyInput');
    previewPane = viewChild<ElementRef<HTMLElement>>('previewPane');

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
     * Data coming from the user. The preview is rendered the same way as the live blog post:
     * markdown-it, then Angular's HTML sanitizer.
     */
    postChanges = new Subject<Post>();
    postPreview = toSignal(
        this.postChanges.pipe(
            debounceTime(150),
            map((post) => markdownit().render(post.body || ''))
        )
    );

    /** Unsaved edits since the post was loaded or last saved */
    dirty = signal(false);
    saving = signal(false);
    saveError = signal('');
    lastSaved = signal('');
    /** Which pane is shown on narrow screens */
    mobilePane = signal<'write' | 'preview'>('write');

    constructor() {
        const title = inject(Title);
        effect(() => {
            const post = this.postData();
            if (post) {
                title.setTitle(this.savedId() === 'new' ? 'New post | fluin.io blog' : `Edit ${post.title} | fluin.io blog`);
                this.dirty.set(false);
                this.contentChange(post);
            }
        });
    }

    contentChange(post: Post) {
        this.postChanges.next(post);
    }

    /** Called for every edit the user makes */
    edited(post: Post) {
        this.dirty.set(true);
        this.contentChange(post);
    }

    /**
     * @param leave Go back to the admin list after a successful save
     */
    async save(post: Post, leave: boolean) {
        this.saving.set(true);
        this.saveError.set('');
        try {
            await this.ep.save(post, this.savedId());
        } catch (error) {
            this.saveError.set(`Not saved: ${error instanceof Error ? error.message : error}`);
            return;
        } finally {
            this.saving.set(false);
        }
        this.dirty.set(false);
        this.lastSaved.set(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));

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

    /** Insert text at the cursor in the body, as if the user typed it */
    insertIntoBody(text: string) {
        const textarea = this.bodyInput()?.nativeElement;
        if (!textarea) {
            return;
        }
        textarea.focus();
        textarea.setRangeText(`\n${text}\n`, textarea.selectionStart, textarea.selectionEnd, 'end');
        textarea.dispatchEvent(new Event('input'));
    }

    setCover(post: Post, url: string) {
        post.image = url;
        this.edited(post);
    }

    /** Keep the preview at the same relative position as the markdown being edited */
    syncPreviewScroll() {
        const textarea = this.bodyInput()?.nativeElement;
        const preview = this.previewPane()?.nativeElement;
        if (!textarea || !preview) {
            return;
        }
        const scrollable = textarea.scrollHeight - textarea.clientHeight;
        const ratio = scrollable > 0 ? textarea.scrollTop / scrollable : 0;
        preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    }

    async delete() {
        try {
            if (await this.ep.delete(this.savedId())) {
                this.dirty.set(false);
                this.router.navigateByUrl('/admin');
            }
        } catch (error) {
            this.saveError.set(`Not deleted: ${error instanceof Error ? error.message : error}`);
        }
    }

    /** Ask before closing or reloading the tab with unsaved edits */
    onBeforeUnload(event: BeforeUnloadEvent) {
        if (this.dirty()) {
            event.preventDefault();
        }
    }
}
