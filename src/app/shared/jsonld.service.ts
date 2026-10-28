import { DOCUMENT, Injectable, OnDestroy, Renderer2, RendererFactory2, inject } from '@angular/core';

import { SAME_AS } from './social-links';

/** Stephen, as the author of the site. src/index.html has the same Person on every page. */
export const PERSON_SCHEMA = {
    '@type': 'Person',
    '@id': 'https://fluin.io/#person',
    name: 'Stephen Fluin',
    url: 'https://fluin.io/bio',
    image: 'https://fluin.io/assets/images/mainpic.jpg',
    jobTitle: 'Head of DevRel',
    worksFor: {
        '@type': 'Organization',
        name: 'Buildkite',
        url: 'https://buildkite.com',
    },
    sameAs: SAME_AS,
};

/** Adds and removes structured data (JSON-LD) scripts in the document head */
@Injectable({ providedIn: 'root' })
export class JsonLdService implements OnDestroy {
    private readonly document = inject(DOCUMENT);
    // Renderer2 can't be injected directly in a service, so create one from the factory
    private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

    /** Replace any schemas this service added (including ones server rendered before hydration) with a new one */
    setSchema(schema: Record<string, unknown> | Record<string, unknown>[]): void {
        this.removeSchemas();

        const script: HTMLScriptElement = this.renderer.createElement('script');
        this.renderer.setAttribute(script, 'type', 'application/ld+json');
        this.renderer.setAttribute(script, 'data-page-schema', '');
        script.textContent = JSON.stringify(schema);
        this.renderer.appendChild(this.document.head, script);
    }

    removeSchemas(): void {
        this.document.head
            .querySelectorAll('script[data-page-schema]')
            .forEach((script) => this.renderer.removeChild(this.document.head, script));
    }

    ngOnDestroy(): void {
        this.removeSchemas();
    }
}
