import { DOCUMENT, Injectable, OnDestroy, Renderer2, RendererFactory2, inject } from '@angular/core';

/** Adds and removes structured data (JSON-LD) scripts in the document head */
@Injectable({ providedIn: 'root' })
export class JsonLdService implements OnDestroy {
    private readonly document = inject(DOCUMENT);
    // Renderer2 can't be injected directly in a service, so create one from the factory
    private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
    private scripts: HTMLScriptElement[] = [];

    /** Replace any schemas this service added with a new one */
    setSchema(schema: Record<string, unknown> | Record<string, unknown>[]): void {
        this.removeSchemas();

        const script: HTMLScriptElement = this.renderer.createElement('script');
        this.renderer.setAttribute(script, 'type', 'application/ld+json');
        script.textContent = JSON.stringify(schema);
        this.renderer.appendChild(this.document.head, script);
        this.scripts.push(script);
    }

    removeSchemas(): void {
        this.scripts.forEach((script) => this.renderer.removeChild(this.document.head, script));
        this.scripts = [];
    }

    ngOnDestroy(): void {
        this.removeSchemas();
    }
}
