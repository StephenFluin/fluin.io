import { Component, ViewChild, ElementRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

declare var ga: any;
declare var gtag: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [
        trigger('routeAnimation', [
            transition('home => blog', [
                style({ height: '{{height}}' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                // animate the leave page away
                group([
                    query(':leave', [
                        animate('0.3s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
                    ]),
                    // and now reveal the enter
                    query(':enter', animate('0.3s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))),
                ]),
                // animate('1s', style({ height: '*'})),
            ]),
            transition('blog => home', [
                style({ height: '{{height}}' }),
                query(':enter', style({ transform: 'translateX(-100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                // animate the leave page away
                group([
                    query(':leave', [
                        animate('0.3s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
                    ]),
                    // and now reveal the enter
                    query(':enter', animate('0.3s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))),
                ]),
                // animate('1s', style({ height: '*'})),
            ]),
        ]),
    ],
})
export class AppComponent {
    /**
     * Save the maxHeight upon each request after a navigation event to ensure
     * it doesn't change, but contains the max height of the routed components.
     */
    private _maxHeight = '0px';
    get maxHeight() {
        if (!this._maxHeight) {
            this.updateHeight();
        }
        return this._maxHeight;
    }
    @ViewChild('container', { static: false }) container: ElementRef;

    constructor(router: Router, activatedRoute: ActivatedRoute, title: Title, meta: Meta) {
        router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((n: NavigationEnd) => {
            const pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            window.scrollTo(0, 0);
            ga('send', 'pageview', n.urlAfterRedirects);
            gtag('config', 'G-2CB60WKV1M', { page_path: n.urlAfterRedirects });
        });
        router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe((next) => {
            meta.removeTag('name=robots');

            if (this.container) {
                this._maxHeight = null;
            }
        });
    }

    /** Get the current page for route animation purposes */
    prepRouteState(outlet) {
        return outlet.activatedRouteData['page'];
    }

    /**
     * Get the max height of the container based on children
     */
    updateHeight() {
        let maxHeight = 0;
        for (let i = 0; i < this.container.nativeElement.children.length; i++) {
            const item = this.container.nativeElement.children[i] as HTMLElement;
            maxHeight = Math.max(item.offsetHeight, maxHeight);
        }

        this._maxHeight = maxHeight + 'px';
    }
}
