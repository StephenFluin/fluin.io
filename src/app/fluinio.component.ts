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
      let pageTitle = router.routerState.snapshot.root.children[0].data['title'];
      if(pageTitle) {
        title.setTitle(pageTitle);
      } else if(pageTitle !== false) {
        title.setTitle("fluin.io");
      }
      window.scrollTo(0,0);
      ga('send', 'pageview', n.urlAfterRedirects);
    });
  }
}
