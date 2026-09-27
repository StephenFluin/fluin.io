import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-no-blog',
    imports: [],
    template: ` <p>Please select a blog post to view the content.</p> `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})
export class NoBlogComponent {}
