import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DomSanitizer } from '@angular/platform-browser';

import { AdminService } from '../shared/admin.service';
import { Post, PostService } from '../shared/post.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as Showdown from 'showdown';
import 'showdown-youtube/dist/showdown-youtube.min.js';

@Component({
    templateUrl: './blog-post.component.html',
})
export class BlogPostComponent {
    post: Observable<Post>;

    constructor(
        route: ActivatedRoute,
        posts: PostService,
        title: Title,
        public adminService: AdminService,
        private sanitized: DomSanitizer
    ) {
        // Based on the requested ID, return a Post
        this.post = route.params.pipe(
            switchMap(params => {
                if (!params['id']) {
                    // If none specified, just get last, it should already be sorted by date
                    return posts.postList.pipe(map(list => list[0]));
                } else {
                    // Otherwise, get specified
                    return posts.postMap.pipe(map(postMap => postMap[params['id']]));
                }
            }),
            map(item => {
                if (item) {
                    title.setTitle(item.title + ' | fluin.io blog');

                    const converter = new Showdown.Converter({ extensions: ['youtube'] });
                    converter.setOption('noHeaderId', 'true');

                    item.renderedBody = sanitized.bypassSecurityTrustHtml(converter.makeHtml(item.body || ''));
                }
                return item;
            })
        );
    }
}
