import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { PostService, Post } from '../shared/post.service';
import { EditablePostService } from './shared/editable-post.service';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { map, switchMap } from 'rxjs/operators';

import * as Showdown from 'showdown';
import 'showdown-youtube/dist/showdown-youtube.min.js';

@Component({
    templateUrl: './edit-post.component.html',
})
export class EditPostComponent {
    renderedBody;
    postData: Observable<Post>;
    converter;

    constructor(
        activatedRoute: ActivatedRoute,
        public posts: PostService,
        public ep: EditablePostService,
        title: Title,
        public router: Router,
        public sanitized: DomSanitizer
    ) {
        this.converter = new Showdown.Converter({extensions: ['youtube']});

        this.postData = activatedRoute.params.pipe(switchMap((params) => {
            let filter;
            if (!params['id']) {
                console.error('No post specified');
                return;
            } else if (params['id'] === 'new') {

                return Observable.of(new Post());
            }

            return posts.postMap.pipe(map(postListObject => {
                console.log('Looking for post from', params, postListObject);
                console.log(postListObject);
                let item = postListObject[params['id']];
                if (item) {
                    title.setTitle('Edit ' + item.title + ' | fluin.io blog');
                    this.renderBody(item);
                }


                return item;
            }));
        }));

    }

    renderBody(post) {
        this.renderedBody = this.sanitized.bypassSecurityTrustHtml(this.converter.makeHtml(post.body || ''));
    }

    save(post) {
        this.ep.save(post);
        this.router.navigateByUrl('/admin');
    }

    delete(post) {
        this.ep.delete(post);
        this.router.navigateByUrl('/admin');
    }

}
