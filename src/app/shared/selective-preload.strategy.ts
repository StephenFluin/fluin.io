import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Only preloads routes explicitly tagged with `data: { preload: true }`.
 * Heavy or auth-gated routes (admin, newsletter) are left untouched.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
    preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
        return route.data?.['preload'] === true ? load() : of(null);
    }
}
