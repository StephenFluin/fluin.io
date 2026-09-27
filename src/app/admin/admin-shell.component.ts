import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Wraps every admin page. Its styles are unencapsulated so they're loaded once and shared by all
 * admin components, but each selector is scoped under `app-admin` so they don't reach the rest of the site.
 */
@Component({
    selector: 'app-admin',
    template: '<router-outlet />',
    styleUrl: './admin-shared.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet],
})
export class AdminShellComponent {}
