import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export const SITE_URL = 'https://fluin.io';

/** Used by pages that don't set their own description. Keep in sync with src/index.html. */
export const DEFAULT_DESCRIPTION =
    'Stephen Fluin is a technology leader in product and DevRel, writing about Angular, Linux, Productivity, SSR, Firebase, and developer tools.';

const DEFAULT_IMAGE = { url: `${SITE_URL}/assets/images/mainpic.jpg`, width: 960, height: 960 };

/** What search engines and social cards should show for a page */
export interface PageHead {
    /** Path on the site, e.g. "/projects". Becomes the canonical URL. */
    path: string;
    title: string;
    description?: string;
    /** Absolute URL. Defaults to Stephen's photo. */
    image?: { url: string; width: number; height: number };
    type?: 'website' | 'article';
}

/** Keeps the description, canonical URL, Open Graph, and Twitter tags in the head in sync with the page */
@Injectable({ providedIn: 'root' })
export class PageHeadService {
    private readonly document = inject(DOCUMENT);
    private readonly meta = inject(Meta);

    update({ path, title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, type = 'website' }: PageHead) {
        const url = SITE_URL + (path === '/' ? '' : path);
        // A wide image gets the large card. The square default photo would be cropped badly in one.
        const card = image.width > image.height ? 'summary_large_image' : 'summary';

        let canonical = this.document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
        if (!canonical) {
            canonical = this.document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            this.document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);

        this.meta.updateTag({ name: 'description', content: description });
        for (const [name, content] of Object.entries({
            'twitter:card': card,
            'twitter:image': image.url,
            'twitter:title': title,
            'twitter:description': description,
        })) {
            this.meta.updateTag({ name, content });
        }
        for (const [property, content] of Object.entries({
            'og:type': type,
            'og:url': url,
            'og:title': title,
            'og:description': description,
            'og:image': image.url,
            'og:image:width': String(image.width),
            'og:image:height': String(image.height),
        })) {
            this.meta.updateTag({ property, content }, `property='${property}'`);
        }
    }
}
