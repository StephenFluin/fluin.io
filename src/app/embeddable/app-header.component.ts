import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
})
export class AppHeaderComponent  { }
