import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { PostService, Post } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';

import { Observable ,  Subject, of as observableOf } from 'rxjs';
import { map, switchMap, debounceTime, tap } from 'rxjs/operators';

import snarkdown from 'snarkdown';
import { SafeHtml } from '@angular/platform-browser';

@Component({
    templateUrl: './edit-post.component.html',
})
export class EditPostComponent {
    renderedBody;
    /**
     * Data coming from the server
     */
    postData: Observable<Post>;
    /**
     * Data coming from the user
     */
    postChanges = new Subject<Post>();
    postPreview: Observable<SafeHtml>;
    converter;

    constructor(
        activatedRoute: ActivatedRoute,
        public posts: PostService,
        public ep: EditablePostService,
        title: Title,
        public router: Router,
        public sanitized: DomSanitizer
    ) {


        this.postPreview = this.postChanges.pipe(
            debounceTime(300),
            map(post => {
                return this.sanitized.bypassSecurityTrustHtml(snarkdown((post && post.body) || ''));
            })
        );

        this.postData = activatedRoute.params.pipe(
            switchMap(params => {
                if (!params['id']) {
                    console.error('No post specified');
                    return;
                } else if (params['id'] === 'new') {
                    return observableOf(new Post());
                }

                return posts.postMap.pipe(
                    map(postListObject => {
                        console.log('Looking for post from', params, postListObject);
                        console.log(postListObject);
                        const item = postListObject[params['id']];
                        if (item) {
                            title.setTitle('Edit ' + item.title + ' | fluin.io blog');
                            this.contentChange(item);
                        }

                        return item;
                    }),
                    tap(post => this.contentChange(post)),
                );
            })
        );

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
