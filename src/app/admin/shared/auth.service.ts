import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from '../../shared/admin.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthService {
    isAdmin: Observable<boolean>;
    name: Observable<string>;
    uid: Observable<string>;

    constructor(public auth: AngularFireAuth, public admin: AdminService) {
        // this.af = {auth:{map:()=>{}}};
        const state = auth.authState;
        console.log('State is', state);

        this.isAdmin = state.pipe(map(authState => !!authState && authState.uid === 'uFgljRJxq9Th4bkTIaDsQFwJuhJ2'));
        this.name = state.pipe(map(authState => (authState ? authState.displayName : null)));
        this.uid = state.pipe(map(authState => (authState ? authState.uid : null)));

        this.isAdmin.subscribe(isAdmin => {
            this.admin.isAdmin = isAdmin;
        });
    }
    login() {
        this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout() {
        this.auth.signOut();
    }
}
