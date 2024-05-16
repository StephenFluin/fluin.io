import { Component, Signal, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { PostService, Post } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';

import { BehaviorSubject, Subject, of as observableOf } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

import snarkdown from 'snarkdown';
import { SafeHtml } from '@angular/platform-browser';
import { UploadComponent } from './upload.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, AsyncPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
    templateUrl: './edit-post.component.html',
    standalone: true,
    imports: [NgIf, MatFormFieldModule, MatInputModule, FormsModule, RouterLink, UploadComponent, AsyncPipe],
})
export class EditPostComponent {
    renderedBody;
    /**
     * Data coming from the server
     */
    postData: Signal<Post | null>;
    /**
     * Data coming from the user
     */
    postChanges = new Subject<Post>();
    postPreview: Signal<SafeHtml>;

    constructor(
        activatedRoute: ActivatedRoute,
        public posts: PostService,
        public ep: EditablePostService,
        title: Title,
        public router: Router,
        public sanitized: DomSanitizer
    ) {
        this.postPreview = toSignal(
            this.postChanges.pipe(
                debounceTime(300),
                map((post) => {
                    return this.sanitized.bypassSecurityTrustHtml(snarkdown((post && post.body) || ''));
                })
            )
        );

        const routeParams = toSignal(activatedRoute.params);

        // Get the post based on the route and set the title
        this.postData = computed(() => {
            const params = routeParams();
            if (!params['id']) {
                console.error('No post specified');
                return;
            } else if (params['id'] === 'new') {
                return new Post();
            }

            const postMap = posts.postMap();
            console.log('Looking for post from', params, postMap);
            const item = postMap[params['id']];
            if (item) {
                title.setTitle('Edit ' + item.title + ' | fluin.io blog');
                this.contentChange(item);
            }

            return item;
        });
    }
    contentChange(post) {
        this.postChanges.next(post);
    }

    save(post) {
        this.ep.save(post);
        this.router.navigateByUrl('/admin');
    }
    onKey(event: KeyboardEvent, post: Post) {
        if (event.ctrlKey && event.key === 's') {
            this.ep.save(post);
            event.preventDefault();
        }
    }

    delete(post) {
        this.ep.delete(post);
        this.router.navigateByUrl('/admin');
    }
}
