import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';

declare var ga : any;

@Component({
  selector: 'app-root',
  templateUrl: 'fluinio.component.html',
})
export class FluinioAppComponent {
  constructor(private router : Router ) {
    /*router.events.filter(e => e instanceof NavigationEnd).subscribe( (n:NavigationEnd) => { 
      ga('send', 'pageview', n.urlAfterRedirects);
    });*/
  }
}
