import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';

@Component({
    selector: 'app-newsletter',
    templateUrl: './newsletter.html',
})
export class NewsletterComponent implements OnInit, AfterViewInit {
    constructor(private elRef: ElementRef) {}

    ngOnInit(): void {}
    ngAfterViewInit() {
        // <script src="https://f.convertkit.com/ckjs/ck.5.js"></script>
        const s = document.createElement('script');
        s.src = 'https://f.convertkit.com/ckjs/ck.5.js';
        this.elRef.nativeElement.appendChild(s);
    }
}
