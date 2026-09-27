import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    imports: [RouterLink, RouterLinkActive],
    host: {
        '(window:resize)': 'onResize()',
    },
})
export class AppHeaderComponent {
    /** Whether the mobile navigation menu is open */
    readonly menuOpen = signal(false);

    toggleMenu() {
        this.menuOpen.update((open) => !open);
    }

    closeMenu() {
        this.menuOpen.set(false);
    }

    /** The menu is only collapsible on narrow screens, so close it when the window gets wide */
    onResize() {
        if (window.innerWidth > 600) {
            this.menuOpen.set(false);
        }
    }
}
