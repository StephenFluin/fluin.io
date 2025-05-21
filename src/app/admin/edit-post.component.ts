import { Component, Signal, computed } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Post, PostService } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';

import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SafeHtml } from '@angular/platform-browser';
import markdownit from 'markdown-it';

import { UploadComponent } from './upload.component';

@Component({
    templateUrl: './edit-post.component.html',
    imports: [MatFormFieldModule, MatInputModule, FormsModule, RouterLink, UploadComponent],
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
                    const md = markdownit();
                    const result = md.render((post && post.body) || '');
                    return this.sanitized.bypassSecurityTrustHtml(result);
                })
            )
        );

        const routeParams = toSignal(activatedRoute.params);

        // Get the post based on the route and set the title
        this.postData = computed(() => {
            const params = routeParams();
            if (!params['id']) {
                console.error('No post specified');
                return null;
            } else if (params['id'] === 'new') {
                return new Post();
            }

            const postMap = posts.postMap.value();
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
