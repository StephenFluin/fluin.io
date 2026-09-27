import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/auth.service';

/**
 * Wraps every admin page: only shows them to the signed-in admin, and keeps the public site's admin hint current.
 *
 * Its styles are unencapsulated so they're loaded once and shared by all admin components,
 * but each selector is scoped under `app-admin` so they don't reach the rest of the site.
 */
@Component({
    selector: 'app-admin',
    template: `
        @if (!auth.firebaseService.authReady()) {
            <p class="admin-page muted">Checking sign-in...</p>
        } @else if (auth.isAdmin()) {
            <router-outlet />
        } @else {
            <div class="admin-page">
                <h1>Admin</h1>
                @if (auth.uid()) {
                    <p>Signed in as {{ auth.name() }} ({{ auth.uid() }}), which isn't an administrator account.</p>
                    <button type="button" class="button" (click)="auth.logout()">Log out</button>
                } @else {
                    <p>Sign in to manage posts.</p>
                    <button type="button" class="button primary" (click)="auth.login()">Sign in with Google</button>
                }
            </div>
        }
    `,
    styleUrl: './admin-shared.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet],
})
export class AdminShellComponent {
    auth = inject(AuthService);
}
