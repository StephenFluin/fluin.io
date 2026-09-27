import { Injectable, computed, effect, inject } from '@angular/core';
import { AdminService } from '../../shared/admin.service';
import { FirebaseService } from '../firebase.service';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect } from 'firebase/auth';

const provider = new GoogleAuthProvider();

@Injectable()
export class AuthService {
    firebaseService = inject(FirebaseService);

    uid = computed(() => this.firebaseService.authState()?.uid || '');
    isAdmin = computed(() => this.uid() === 'uFgljRJxq9Th4bkTIaDsQFwJuhJ2');
    name = computed(() => this.firebaseService.authState()?.displayName || 'Unknown');

    constructor() {
        // Keep the public site's admin hint in sync, once Firebase has restored (or ruled out) a session
        const admin = inject(AdminService);
        effect(() => {
            if (this.firebaseService.authReady()) {
                admin.setAdmin(this.isAdmin());
            }
        });
    }

    login() {
        const auth = this.firebaseService.auth;
        signInWithPopup(auth, provider).catch((error) => {
            if (error.code == 'auth/popup-blocked') {
                console.log('Falling back to redirect.');
                signInWithRedirect(auth, provider);
                return;
            }
            console.error('Error with Sign In', error.code, error.message);
        });
    }

    logout() {
        signOut(this.firebaseService.auth);
    }
}
