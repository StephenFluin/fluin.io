import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

import "../../shared/shareResults";

@Injectable()
export class AuthService {
    isAdmin: Observable<boolean>;
    name: Observable<string>;
    uid: Observable<string>;
    
    constructor(public af: AngularFire) {
        //this.af = {auth:{map:()=>{}}};
        let state = this.af.auth.shareResults();

        this.isAdmin = state.map( authState => !!authState);
        this.name = state.map( authState => ( authState ? authState.google.displayName : null));
        this.uid = state.map( authState => authState ? authState.uid: null);
        this.name.subscribe(n=>console.log("new auth state:",n),e=>console.log(e),()=>console.log("failure"));

        
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