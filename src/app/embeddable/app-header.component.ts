import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    imports: [RouterLink, RouterLinkActive]
})
export class AppHeaderComponent {
    menuOpen = false;

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    closeMenu() {
        this.menuOpen = false;
    }

    @HostListener('window:resize')
    onResize() {
        if (window.innerWidth > 600 && this.menuOpen) {
            this.menuOpen = false;
        }
    }
}
