import { Component, Inject, Signal, computed, DOCUMENT, effect, inject } from '@angular/core';
import { MetaDefinition, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import { AdminService } from '../shared/admin.service';
import { Post, PostService } from '../shared/post.service';

import { toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import markdownit from 'markdown-it';
import { JsonLdService } from '../shared/jsonld.service';

@Component({
    templateUrl: './blog-post.component.html',
    imports: [RouterLink],
})
export class BlogPostComponent {
    post: Signal<Post>;
    router = inject(Router);
    jsonLd = inject(JsonLdService);

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
            const item = id ? posts.postMap.value()?.[id] : posts.postList()?.[0];
            if (!item) {
                return null;
            }
            title.setTitle(item.title + ' | fluin.io blog');
            this.updateCanonicalUrl(`https://fluin.io/blog/${item.id}`);
            const description = item.body.split('\n')[0];

            const twitterMetadata = {
                'twitter:card': 'summary',
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

            // Json LD
          this.jsonLd.setSchema({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: item.title,
            url: `https://fluin.io/blog/${item.id}`,
            datePublished: item.date, // ISO format: 'YYYY-MM-DD'
            image: item.image,
            description: description,
            author: {
                '@type': 'Person',
                name: 'Stephen Fluin',
                url: 'https://fluin.io/bio',
                image: 'https://fluin.io/assets/images/mainpic.jpg',
                jobTitle: 'VP of Product',
                worksFor: {
                '@type': 'Organization',
                name: 'HeroDevs',
                url: 'https://herodevs.com',
                },
                sameAs: [
                'https://twitter.com/stephenfluin',
                'https://bsky.app/profile/stephenfluin.bsky.social',
                'https://github.com/stephenfluin',
                'https://www.linkedin.com/in/stephenfluin',
                ],
            },
            publisher: {
                '@type': 'Person',
                name: 'Stephen Fluin',
                url: 'https://fluin.io',
            },
            });

            const md = markdownit();
            const result = md.render(item.body || '');

            item.renderedBody = sanitized.bypassSecurityTrustHtml(result);
            return item;
        });
        effect(() => {
            if (!this.post() && posts.postMap.value()) {
                this.router.navigate(['/404']);
            }
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
