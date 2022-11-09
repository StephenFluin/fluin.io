import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAction, DatabaseSnapshot } from '@angular/fire/compat/database';
import { Input } from '@angular/core';

// This is an OperatorFunction
export function keyify<T extends object>(source: Observable<AngularFireAction<DatabaseSnapshot<T>>[]>): Observable<({key: string} & T)[]> {
    return source.pipe(
        map(
            // Typing is wrong here as of 2018-06-23, see https://github.com/Microsoft/TypeScript/issues/10727
            actions => actions.map(action => ({ key: action.key, ...(<any>action.payload.val()) }))
        ),
        map(list => list),

    );
}
