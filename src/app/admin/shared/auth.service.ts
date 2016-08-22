import { Inject } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

console.log("Angularfire is",AngularFire);

export class AuthService {
    isAdmin: Observable<boolean>;

    constructor() {//public af: AngularFire) {

        //this.isAdmin = this.af.auth.map( authState => !!authState);
        this.isAdmin = Observable.of(true);
    }
    /*login() {
        this.af.auth.login({
            provider: AuthProviders.Google,
            method: AuthMethods.Popup,
        });
    }

    logout() {
        this.af.auth.logout();
    }*/

}