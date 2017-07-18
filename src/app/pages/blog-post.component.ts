import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DomSanitizer } from '@angular/platform-browser';

import { Post, PostService } from '../shared/post.service';
import 'rxjs/add/operator/switchMap';

import * as Showdown from 'showdown';
import 'showdown-youtube/dist/showdown-youtube.min.js';

@Component({
    templateUrl: './blog-post.component.html',
})
export class BlogPostComponent {
    post;

    constructor(activatedRoute: ActivatedRoute,
        posts: PostService,
        title: Title,
        private sanitized: DomSanitizer) {

        // Based on the requested ID, return a Post
        this.post = activatedRoute.params.switchMap((params) => {
            if (!params['id']) {
                // If none specified, just get last, it should already be sorted by date
                return posts.postList.map(list => list[0]);
            } else {
                // Otherwise, get specified
                return posts.postMap.map(postMap => postMap[params['id']]);
            }
        }).map(item => {
                title.setTitle(item.title + ' | fluin.io blog');
                let converter = new Showdown.Converter({extensions: ['youtube']});
                converter.setOption('noHeaderId', 'true');

                item.renderedBody = sanitized.bypassSecurityTrustHtml(converter.makeHtml(item.body || ''));
                return item;
        })
    }
}
