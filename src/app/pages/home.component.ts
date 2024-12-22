import { Component } from '@angular/core';
import { PostListComponent } from '../embeddable/post-list.component';

@Component({
    templateUrl: './home.component.html',
    imports: [PostListComponent],
})
export class HomeComponent {}
