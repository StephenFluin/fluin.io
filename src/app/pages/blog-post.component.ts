import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DomSanitizer } from '@angular/platform-browser';

import { PostService } from '../shared/post.service';
import 'rxjs/add/operator/switchMap';

import * as Showdown from 'showdown';

@Component({
    templateUrl: './blog-post.component.html',
})
export class BlogPostComponent {
    post;

    constructor(activatedRoute: ActivatedRoute,
        posts: PostService,
        title: Title,
        private sanitized: DomSanitizer) {

        activatedRoute.params.switchMap((params) => {
            let filter;
            if (!params['id']) {
                // If none specified, just get last, it should already be sorted by date
                filter = list => list[Object.keys(list)[Object.keys(list).length - 1]]
            } else {
                // Otherwise, get specified
                filter = list => list[params['id']];
            }
            return posts.postMap.map(response => {

                let item = filter(response);
                title.setTitle(item.title + ' | fluin.io blog');
                let converter = new Showdown.Converter();
                converter.setOption('noHeaderId', 'true');

                item.renderedBody = converter.makeHtml(item.body || '');
                item.renderedBody = this.sanitized.bypassSecurityTrustHtml(item.renderedBody.replace(/[\r\n]/g, ''));
                return item;
            })
        }).subscribe(post => {
            this.post = post;
        });
    }
}
