import { Component, DOCUMENT, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { AdminService } from '../shared/admin.service';
import { buildOptimizedImageUrl, buildResponsiveImageSet, IMAGE_QUALITY, toAbsoluteImageUrl } from '../shared/image-url';
import { JsonLdService } from '../shared/jsonld.service';
import { Post } from '../shared/post.service';
import { NotFoundComponent } from '../not-found.component';

const HERO_IMAGE_SIZES = '(max-width: 900px) calc(100vw - 64px), 800px';

@Component({
    templateUrl: './blog-post.component.html',
    imports: [RouterLink, NotFoundComponent],
})
export class BlogPostComponent {
    protected readonly adminService = inject(AdminService);
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly jsonLd = inject(JsonLdService);
    private readonly document = inject(DOCUMENT);

    /** The post's slug, bound from the `:id` route parameter */
    readonly id = input.required<string>();

    /** The full post, including its rendered body, fetched individually so list views stay lightweight */
    private readonly postResource = httpResource<Post>(() => `/api/posts/${this.id()}`);
    readonly post = computed(() => (this.postResource.hasValue() ? this.postResource.value() : undefined));
    /** The post couldn't be loaded (usually a 404 from /api/posts/:id) */
    readonly postFailed = computed(() => !!this.postResource.error());
    protected readonly heroImageSizes = HERO_IMAGE_SIZES;

    constructor() {
        effect(() => {
            const post = this.post();
            if (post) {
                this.updateHead(post);
            }
        });

        // Don't leave this post's canonical URL, preload, or structured data on the next page
        inject(DestroyRef).onDestroy(() => {
            this.document.head.querySelector("link[rel='canonical']")?.remove();
            this.document.head.querySelector("link[data-lcp-preload='route']")?.remove();
            this.jsonLd.removeSchemas();
        });
    }

    postImageUrl(post: Post) {
        return buildOptimizedImageUrl(post.image, { width: 1200, height: 675, fit: 'cover', quality: IMAGE_QUALITY.hero });
    }

    postImageSet(post: Post) {
        return buildResponsiveImageSet(post.image, [800, 1200], {
            width: 1200,
            height: 675,
            fit: 'cover',
            quality: IMAGE_QUALITY.hero,
        });
    }

    /** Title, social/search metadata, canonical URL, hero image preload, and structured data for the post */
    private updateHead(post: Post) {
        const url = `https://fluin.io/blog/${post.id}`;
        const description = summarize(post.body ?? '');
        const socialImage = toAbsoluteImageUrl(
            buildOptimizedImageUrl(post.image, { width: 1200, height: 630, fit: 'cover', quality: IMAGE_QUALITY.hero })
        );

        this.title.setTitle(`${post.title} | fluin.io blog`);
        this.setLink("link[rel='canonical']", { rel: 'canonical', href: url });
        this.setLink("link[data-lcp-preload='route']", {
            'data-lcp-preload': 'route',
            rel: 'preload',
            as: 'image',
            href: this.postImageUrl(post),
            imagesrcset: this.postImageSet(post),
            imagesizes: HERO_IMAGE_SIZES,
            fetchpriority: 'high',
        });

        this.meta.updateTag({ name: 'description', content: description });
        for (const [name, content] of Object.entries({
            'twitter:card': 'summary_large_image',
            'twitter:image': socialImage,
            'twitter:title': post.title ?? '',
            'twitter:description': description,
        })) {
            this.meta.updateTag({ name, content });
        }
        for (const [property, content] of Object.entries({
            'og:type': 'article',
            'og:url': url,
            'og:title': post.title ?? '',
            'og:description': description,
            'og:image': socialImage,
            'og:image:width': '1200',
            'og:image:height': '630',
        })) {
            this.meta.updateTag({ property, content }, `property='${property}'`);
        }

        this.jsonLd.setSchema({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            url,
            datePublished: post.date,
            image: socialImage,
            description,
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
    }

    /** Create or update a <link> in the head. Null attribute values are removed. */
    private setLink(selector: string, attributes: Record<string, string | null>) {
        let link = this.document.head.querySelector<HTMLLinkElement>(selector);
        if (!link) {
            link = this.document.createElement('link');
            this.document.head.appendChild(link);
        }
        for (const [name, value] of Object.entries(attributes)) {
            if (value === null) {
                link.removeAttribute(name);
            } else {
                link.setAttribute(name, value);
            }
        }
    }
}

/** The first paragraph of a post's markdown (skipping headings), used as its description */
function summarize(body: string) {
    const lines = body.split('\n');
    return (lines.find((line) => line.trim() && !line.trim().startsWith('#')) ?? lines[0]).trim();
}
