import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppHeaderComponent } from './embeddable/app-header.component';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [AppHeaderComponent, RouterOutlet, RouterLink],
})
export class AppComponent {
    constructor(router: Router, title: Title, meta: Meta) {
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        const gtag = isBrowser ? window.gtag : () => {};

        gtag('config', 'G-QMN47NKMMS');

        router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((n: NavigationEnd) => {
            const pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            meta.removeTag('name=robots');
            if (isBrowser) {
                window.scrollTo(0, 0);
            }
            gtag('config', 'G-QMN47NKMMS', { page_path: n.urlAfterRedirects });
        });
    }
}
