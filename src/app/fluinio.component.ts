import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/filter';

declare var ga : any;

@Component({
  selector: 'app-root',
  templateUrl: 'fluinio.component.html',
})
export class FluinioAppComponent {
  constructor(router : Router ) {
    router.events.filter(e => e instanceof NavigationEnd).subscribe( (n:NavigationEnd) => { 
      ga('send', 'pageview', n.urlAfterRedirects);
    });
  }
}
