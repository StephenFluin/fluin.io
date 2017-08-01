import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';

import { trigger, transition, group, query, style, animate } from '@angular/animations';

declare var ga: any;
@Component({
    selector: 'app-root',
    templateUrl: './fluinio.component.html',
    animations: [
        trigger('routeAnimation', [
            transition('1 => 2', [
                style({ height: '!'}),
                query(':enter', style( { transform: 'translateX(100%)'})),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0})),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)'}))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)'}))]),
                ])
            ]),
            transition('2 => 1', [
                style({ height: '!'}),
                query(':enter', style( { transform: 'translateX(-100%)'})),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0})),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(100%)'}))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)'}))]),
                ])
            ])
        ])
    ]
})
export class FluinioAppComponent {
    constructor(router: Router, activatedRoute: ActivatedRoute, title: Title) {
        router.events.filter(e => e instanceof NavigationEnd).subscribe((n: NavigationEnd) => {
            let pageTitle = router.routerState.snapshot.root.children[0].data['title'];
            if (pageTitle) {
                title.setTitle(pageTitle);
            } else if (pageTitle !== false) {
                title.setTitle('fluin.io');
            }
            window.scrollTo(0, 0);
            ga('send', 'pageview', n.urlAfterRedirects);
        });
    }

    getDepth(outlet) {
        return outlet.activatedRouteData['depth'];
    }
}
