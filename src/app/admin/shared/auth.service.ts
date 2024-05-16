import { Injectable, Signal, computed, effect } from '@angular/core';
import { AdminService } from '../../shared/admin.service';
import { FirebaseService } from '../firebase.service';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect } from 'firebase/auth';

const provider = new GoogleAuthProvider();

@Injectable()
export class AuthService {
    isAdmin: Signal<boolean>;
    name: Signal<string>;
    uid: Signal<string>;

    constructor(public firebaseService: FirebaseService, public admin: AdminService) {
        const provider = new GoogleAuthProvider();

        // this.af = {auth:{map:()=>{}}};
        const state = firebaseService.auth.currentUser;

        this.uid = computed(() => this.firebaseService.authState()?.uid || '');
        this.isAdmin = computed(() => this.uid() === 'uFgljRJxq9Th4bkTIaDsQFwJuhJ2');
        this.name = computed(() => this.firebaseService.authState()?.displayName || 'Unknown');

        effect(() => {
            this.admin.isAdmin = this.isAdmin();
        });
    }
    login() {
        const auth = this.firebaseService.auth;
        signInWithPopup(auth, provider)
            .then((result) => {
                // Do we need this?
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                if (errorCode == 'auth/popup-blocked') {
                    console.log('Falling back to redirect.');
                    signInWithRedirect(auth, provider);
                }

                console.log('Error with Sign In', errorCode, errorMessage, email, credential);
            });
    }

    logout() {
        signOut(this.firebaseService.auth);
    }
}
