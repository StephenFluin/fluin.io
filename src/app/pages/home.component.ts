import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Component({
  templateUrl: 'home.component.html',
})
export class HomeComponent  {
  posts : Observable<any[]>; 
  constructor(http : Http) {
    this.posts = http.get('/posts.json')
      .map(response => {
        let result = response.json() as any[];
        return result.splice(0,4);
      });
  }
}
