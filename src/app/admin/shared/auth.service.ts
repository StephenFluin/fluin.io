import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

@Injectable()
export class AuthService {
    isAdmin: Observable<boolean>;
    name: Observable<string>;
    uid: Observable<string>;
    
    constructor(public af: AngularFire) {
        //this.af = {auth:{map:()=>{}}};
        let state = this.af.auth.cache(1);

        this.isAdmin = state.map( authState => !!authState);
        this.name = state.map( authState => ( authState ? authState.google.displayName : ''));
        this.uid = state.map( authState => authState.uid);
        this.name.subscribe(n=>console.log(n),e=>console.log(e),()=>console.log("failure"));

        
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