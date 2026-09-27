import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppHeaderComponent } from './embeddable/app-header.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [AppHeaderComponent, RouterOutlet, RouterLink],
})
export class AppComponent {
    constructor() {
        // Clear the previous page's noindex before the next page is created, so NotFoundComponent can set it again
        const meta = inject(Meta);
        inject(Router)
            .events.pipe(filter((event) => event instanceof NavigationStart))
            .subscribe(() => meta.removeTag('name=robots'));
    }
}
