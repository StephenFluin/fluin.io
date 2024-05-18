import { Component, Inject, Signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, MetaDefinition } from '@angular/platform-browser';

import { DomSanitizer } from '@angular/platform-browser';

import { AdminService } from '../shared/admin.service';
import { Post, PostService } from '../shared/post.service';

import snarkdown from 'snarkdown';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT, NgIf, AsyncPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
    templateUrl: './blog-post.component.html',
    standalone: true,
    imports: [NgIf, RouterLink, AsyncPipe],
})
export class BlogPostComponent {
    post: Signal<Post>;

    constructor(
        route: ActivatedRoute,
        posts: PostService,
        title: Title,
        meta: Meta,
        public adminService: AdminService,
        private sanitized: DomSanitizer,
        @Inject(DOCUMENT) private dom: Document
    ) {
        // Based on the requested ID, return a Post
        const routeParams = toSignal(route.params);
        this.post = computed(() => {
            const id = routeParams()['id'];
            const item = id ? posts.postMap()[id] : posts.postList()[0];
            if (!item) {
                return null;
            }
            title.setTitle(item.title + ' | fluin.io blog');
            this.updateCanonicalUrl(`https://fluin.io/blog/${item.id}`);
            const description = item.body.split('\n')[0];

            const twitterMetadata = {
                'twitter:card': 'summary',
                // Moved to global markup
                // 'twitter:site': '@stephenfluin',
                // 'twitter:creator': '@stephenfluin',
                'twitter:image': item.image,
            };
            const openGraphMeta = {
                'og:url': `https://fluin.io/blog/${item.id}`,
                'og:title': `${item.title}`,
                'og:description': description,
                'og:image': `${item.image}`,
            };

            const tags: MetaDefinition[] = Object.keys(twitterMetadata).map((key) => ({
                name: key,
                content: twitterMetadata[key],
            }));
            const tags2: MetaDefinition[] = Object.keys(openGraphMeta).map((key) => ({
                property: key,
                content: openGraphMeta[key],
            }));

            meta.addTags([...tags, ...tags2]);

            item.renderedBody = sanitized.bypassSecurityTrustHtml(snarkdown(item.body || ''));
            return item;
        });
    }
    updateCanonicalUrl(url: string) {
        const head = this.dom.getElementsByTagName('head')[0];
        let element: HTMLLinkElement = this.dom.querySelector(`link[rel='canonical']`) || null;
        if (element == null) {
            element = this.dom.createElement('link') as HTMLLinkElement;
            head.appendChild(element);
        }
        element.setAttribute('rel', 'canonical');
        element.setAttribute('href', url);
    }
}
