import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './views/blog-home.component.html',
})
export class BlogHomeComponent {
  constructor(activatedRoute: ActivatedRoute, http: Http, router: Router) {
    http.get('/assets/posts.json').map(response => {
      let item = (response.json() as any[])[0]
      return item.id;
    }).subscribe(id => {
      console.log('got ', id);
      router.navigate(['blog', id]);
    });
  }

}
