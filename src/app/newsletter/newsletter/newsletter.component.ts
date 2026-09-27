import { Component, DOCUMENT, ElementRef, afterNextRender, inject } from '@angular/core';

@Component({
    selector: 'app-newsletter',
    templateUrl: './newsletter.html',
})
export class NewsletterComponent {
    constructor() {
        // The ConvertKit form needs its script, which only makes sense in the browser
        const host: HTMLElement = inject(ElementRef).nativeElement;
        const document = inject(DOCUMENT);
        afterNextRender(() => {
            const script = document.createElement('script');
            script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
            host.appendChild(script);
        });
    }
}
