import { inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JsonLdService implements OnDestroy {
  private document = inject(DOCUMENT);
  private renderer: Renderer2;
  private scripts: HTMLScriptElement[] = [];

  constructor(rendererFactory: RendererFactory2) {
    // Renderer2 can't be injected directly in a service — use the factory
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setSchema(schema: Record<string, unknown> | Record<string, unknown>[]): void {
    this.removeSchemas(); // Clear previous before adding new

    const script: HTMLScriptElement = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    script.textContent = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
    this.scripts.push(script);
  }

  removeSchemas(): void {
    this.scripts.forEach(s => this.renderer.removeChild(this.document.head, s));
    this.scripts = [];
  }

  ngOnDestroy(): void {
    this.removeSchemas();
  }
}