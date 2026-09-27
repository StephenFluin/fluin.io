import { Injectable, afterNextRender, signal } from '@angular/core';

const ADMIN_HINT_KEY = 'fluin-admin';

/**
 * Lets public pages offer admin shortcuts (like "Edit This Post") without loading the admin module.
 *
 * The admin module records whether the signed-in user is the admin in localStorage, and public pages
 * read that hint. It only decides what to show: the database and storage rules decide what can change.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
    private readonly admin = signal(false);
    readonly isAdmin = this.admin.asReadonly();

    constructor() {
        // localStorage only exists in the browser. Reading it after the first render also keeps
        // hydration matching the server-rendered HTML, which never shows admin shortcuts.
        afterNextRender(() => this.admin.set(readHint()));
    }

    /** Called by the admin module whenever Firebase confirms who is signed in */
    setAdmin(isAdmin: boolean) {
        this.admin.set(isAdmin);
        try {
            if (isAdmin) {
                localStorage.setItem(ADMIN_HINT_KEY, '1');
            } else {
                localStorage.removeItem(ADMIN_HINT_KEY);
            }
        } catch {
            // Storage can be unavailable (private browsing, blocked site data); the hint just won't persist
        }
    }
}

function readHint() {
    try {
        return localStorage.getItem(ADMIN_HINT_KEY) === '1';
    } catch {
        return false;
    }
}
