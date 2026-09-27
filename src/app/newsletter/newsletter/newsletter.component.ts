import { AfterViewInit, Component, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-newsletter',
    templateUrl: './newsletter.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class NewsletterComponent implements AfterViewInit {
    constructor(private elRef: ElementRef) {}

    ngAfterViewInit() {
        // <script src="https://f.convertkit.com/ckjs/ck.5.js"></script>
        if (!document) {
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://f.convertkit.com/ckjs/ck.5.js';
        this.elRef.nativeElement.appendChild(s);
    }
}
