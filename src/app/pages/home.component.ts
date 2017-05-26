import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { PostService } from '../shared/post.service';

import "rxjs/add/operator/map";

@Component({
  templateUrl: './views/home.component.html',
})
export class HomeComponent {}
