import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import 'rxjs/add/operator/filter';

declare var ga: any;

@Component({
  selector: 'app-root',
  templateUrl: './fluinio.component.html',
})
export class FluinioAppComponent {
  constructor(router: Router, activatedRoute: ActivatedRoute, title: Title) {
    router.events.filter(e => e instanceof NavigationEnd).subscribe((n: NavigationEnd) => {
      ga('send', 'pageview', n.urlAfterRedirects);
      console.log(activatedRoute);
      //title.setTitle(ActivatedRoute.arguments);
    });
  }
}
