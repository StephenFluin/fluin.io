import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

console.log("Angularfire is",AngularFire);

@Injectable()
export class AuthService {
    isAdmin: Observable<boolean>;
    
    constructor(public af: AngularFire) {
        //this.af = {auth:{map:()=>{}}};
        this.isAdmin = this.af.auth.map( authState => !!authState);
        //this.isAdmin = Observable.of(true);
    }
    login() {
        this.af.auth.login({
            provider: AuthProviders.Google,
            method: AuthMethods.Popup,
        });
    }

    logout() {
        this.af.auth.logout();
    }

}