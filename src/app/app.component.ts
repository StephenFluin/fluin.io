import { Component, inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppHeaderComponent } from './embeddable/app-header.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AppHeaderComponent, RouterOutlet, RouterLink],
})
export class AppComponent {
    constructor(router: Router, title: Title, meta: Meta) {
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

        router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
            const pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            if (isBrowser) {
                window.scrollTo(0, 0);
            }
        });
        // Clear the previous page's noindex before the next page is created, so NotFoundComponent can set it again
        router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => meta.removeTag('name=robots'));
    }
}
