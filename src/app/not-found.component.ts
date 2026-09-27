import { Component, ChangeDetectionStrategy, RESPONSE_INIT, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/**
 * Shown for unknown routes and missing posts. When server rendered, it also sets the 404 status.
 */
@Component({
    selector: 'not-found',
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<div style="margin:128px 16px;text-align:center;">Path not found.</div>',
})
export class NotFoundComponent {
    constructor() {
        inject(Meta).updateTag({ name: 'robots', content: 'noindex' });

        const responseInit = inject(RESPONSE_INIT, { optional: true });
        if (responseInit) {
            responseInit.status = 404;
        }
    }
}
