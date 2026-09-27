import { Component, DOCUMENT, DestroyRef, inject } from '@angular/core';
import { PostListComponent } from '../embeddable/post-list.component';

@Component({
    templateUrl: './home.component.html',
    imports: [PostListComponent],
})
export class HomeComponent {
    constructor() {
        // Preload the intro photo, the largest contentful paint on this page
        const document = inject(DOCUMENT);
        const preload = document.createElement('link');
        preload.setAttribute('data-lcp-preload', 'route');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('as', 'image');
        preload.setAttribute('href', '/assets/images/mainpic-300.jpg');
        preload.setAttribute(
            'imagesrcset',
            '/assets/images/mainpic-300.jpg 300w, /assets/images/mainpic-600.jpg 600w, /assets/images/mainpic.jpg 960w'
        );
        preload.setAttribute('imagesizes', '(max-width: 600px) min(calc(100vw - 32px), 430px), 300px');
        preload.setAttribute('fetchpriority', 'high');
        document.head.querySelector("link[data-lcp-preload='route']")?.remove();
        document.head.appendChild(preload);

        inject(DestroyRef).onDestroy(() => preload.remove());
    }
}
