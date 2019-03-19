import { Component, ViewChild, ElementRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

declare var ga: any;
@Component({
    selector: 'app-root',
    templateUrl: './fluinio.component.html',
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
export class FluinioAppComponent {
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
    @ViewChild('container') container: ElementRef;

    constructor(router: Router, activatedRoute: ActivatedRoute, title: Title, meta: Meta) {
        router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((n: NavigationEnd) => {
            const pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            window.scrollTo(0, 0);
            ga('send', 'pageview', n.urlAfterRedirects);
        });
        router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(next => {
            meta.removeTag('name=robots');

            if (this.container) {
                this._maxHeight = null;
            }
        });

        // Setup Fullstory
        window['_fs_debug'] = false;
        window['_fs_host'] = 'fullstory.com';
        window['_fs_org'] = 'K11CD';
        window['_fs_namespace'] = 'FS';
        (function(m, n, e, t, l, o, g, y) {
            if (e in m) {
                if (m.console && m.console.log) {
                    m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');
                }
                return;
            }
            g = m[e] = function(a, b, s) {
                g.q ? g.q.push([a, b, s]) : g._api(a, b, s);
            };
            g.q = [];
            o = n.createElement(t);
            o.async = 1;
            o.src = 'https://' + window['_fs_host'] + '/s/fs.js';
            y = n.getElementsByTagName(t)[0];
            y.parentNode.insertBefore(o, y);
            g.identify = function(i, v, s) {
                g(l, { uid: i }, s);
                if (v) {
                    g(l, v, s);
                }
            };
            g.setUserVars = function(v, s) {
                g(l, v, s);
            };
            g.event = function(i, v, s) {
                g('event', { n: i, p: v }, s);
            };
            g.shutdown = function() {
                g('rec', !1);
            };
            g.restart = function() {
                g('rec', !0);
            };
            g.consent = function(a) {
                g('consent', !arguments.length || a);
            };
            g.identifyAccount = function(i, v) {
                o = 'account';
                v = v || {};
                v.acctId = i;
                g(o, v);
            };
            g.clearUserCookie = function() {};
        })(window, document, window['_fs_namespace'], 'script', 'user');
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
