import { Component, Inject, Signal, computed, DOCUMENT, effect, inject } from '@angular/core';
import { MetaDefinition, Title, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import { AdminService } from '../shared/admin.service';
import { Post, PostService } from '../shared/post.service';

import { toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import markdownit from 'markdown-it';
import { JsonLdService } from '../shared/jsonld.service';
import { buildOptimizedImageUrl, buildResponsiveImageSet, IMAGE_QUALITY, toAbsoluteImageUrl } from '../shared/image-url';
import { httpResource } from '@angular/common/http';

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

        // Fetch the full post (including body) individually so the list view
        // can load a lightweight summaries-only payload.
        const postResource = httpResource<Post>(() => {
            const id = routeParams()?.['id'];
            return id ? `/api/posts/${id}` : undefined;
        });

        this.post = computed(() => {
            const item = postResource.value();
            if (!item) {
                return null;
            }
            title.setTitle(item.title + ' | fluin.io blog');
            this.updateCanonicalUrl(`https://fluin.io/blog/${item.id}`);
            const rawDescription =
                item.body.split('\n').find((line) => line.trim() && !line.trim().startsWith('#')) || item.body.split('\n')[0];
            const description = rawDescription.trim();
            const socialImage = toAbsoluteImageUrl(
                buildOptimizedImageUrl(item.image, {
                    width: 1200,
                    height: 630,
                    fit: 'cover',
                    quality: IMAGE_QUALITY.hero,
                })
            );

            const twitterMetadata = {
                'twitter:card': 'summary_large_image',
                'twitter:image': socialImage,
                'twitter:title': item.title,
                'twitter:description': description,
            };
            const openGraphMeta = {
                'og:url': `https://fluin.io/blog/${item.id}`,
                'og:title': `${item.title}`,
                'og:description': description,
                'og:image': socialImage,
                'og:image:width': '1200',
                'og:image:height': '630',
            };

            const tags: MetaDefinition[] = Object.keys(twitterMetadata).map((key) => ({
                name: key,
                content: twitterMetadata[key],
            }));
            const tags2: MetaDefinition[] = Object.keys(openGraphMeta).map((key) => ({
                property: key,
                content: openGraphMeta[key],
            }));

            [...tags].forEach((tag) => meta.updateTag(tag));
            [...tags2].forEach((tag) => meta.updateTag(tag, `property='${tag.property}'`));

            // Render markdown separately to memoize expensive parsing.
            item.renderedBody = this.renderMarkdown(item.body || '');

            // Json LD
            this.jsonLd.setSchema({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: item.title,
                url: `https://fluin.io/blog/${item.id}`,
                datePublished: item.date,
                image: socialImage,
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

            return item;
        });
        effect(() => {
            if (!this.post() && postResource.hasValue()) {
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

    postImageUrl(post: Post) {
        return buildOptimizedImageUrl(post.image, {
            width: 1200,
            height: 675,
            fit: 'cover',
            quality: IMAGE_QUALITY.hero,
        });
    }

    postImageSet(post: Post) {
        return buildResponsiveImageSet(post.image, [800, 1200], {
            width: 1200,
            height: 675,
            fit: 'cover',
            quality: IMAGE_QUALITY.hero,
        });
    }

    /**
     * Memoized markdown renderer. Caches by body hash to avoid expensive
     * re-parsing if the post body hasn't changed.
     */
    private markdownCache = new Map<string, SafeHtml>();

    private renderMarkdown(body: string): SafeHtml {
        if (this.markdownCache.has(body)) {
            return this.markdownCache.get(body)!;
        }

        const md = markdownit();
        const result = md.render(body);
        const safe = this.sanitized.bypassSecurityTrustHtml(result);
        this.markdownCache.set(body, safe);
        return safe;
    }
}
