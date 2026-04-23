import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PostListComponent } from '../embeddable/post-list.component';

@Component({
    templateUrl: './home.component.html',
    imports: [PostListComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
    constructor(@Inject(DOCUMENT) private dom: Document) {}

    ngOnInit(): void {
        const head = this.dom.head;
        let preload = this.dom.querySelector("link[data-lcp-preload='route']") as HTMLLinkElement | null;
        if (!preload) {
            preload = this.dom.createElement('link');
            head.appendChild(preload);
        }

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
    }

    ngOnDestroy(): void {
        const preload = this.dom.querySelector("link[data-lcp-preload='route']");
        preload?.remove();
    }
}
