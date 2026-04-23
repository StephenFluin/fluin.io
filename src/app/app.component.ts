import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppHeaderComponent } from './embeddable/app-header.component';

declare let ga: any;
declare let gtag: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [AppHeaderComponent, RouterOutlet, RouterLink],
})
export class AppComponent {
    constructor(router: Router, title: Title, meta: Meta) {
        router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((n: NavigationEnd) => {
            const pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            meta.removeTag('name=robots');
            try {
                window.scrollTo(0, 0);
                ga('send', 'pageview', n.urlAfterRedirects);
                gtag('config', 'G-2CB60WKV1M', { page_path: n.urlAfterRedirects });

            } catch (err) {
                // Maybe not in a browser?
            }
        });
    }
}
