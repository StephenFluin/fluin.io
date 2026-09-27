import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { User, getAuth } from 'firebase/auth';
import { ref as dbRef, get, getDatabase, onValue, push, remove, set, update } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { FIREBASE_APP } from './admin.routes';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    fbApp = inject(FIREBASE_APP);
    db = getDatabase(this.fbApp);
    storage = getStorage(this.fbApp);
    auth = getAuth(this.fbApp);
    authState = signal<User | null>(null);
    /** False until Firebase has restored (or ruled out) a signed-in session */
    authReady = signal(false);

    constructor() {
        this.auth.onAuthStateChanged((user) => {
            this.authState.set(user);
            this.authReady.set(true);
        });
    }

    /**
     * Get a signal with an array of objects from a path in the realtime db.
     * Must be called in an injection context; the listener stops when that context is destroyed.
     * @param path Location in realtime db
     */
    list<T>(path: string) {
        const result = signal<(T & { key: string })[] | null>(null);
        const unsubscribe = this.watchList<T>(path, (list) => result.set(list));
        inject(DestroyRef).onDestroy(unsubscribe);
        return result.asReadonly();
    }

    /**
     * Listen to a path in the realtime db as an array of objects, each with its db key attached.
     * @returns A function that stops listening
     */
    watchList<T>(path: string, callback: (list: (T & { key: string })[]) => void) {
        return onValue(this.dbRef(path), (snapshot) => {
            const value = snapshot.val() || {};
            callback(Object.keys(value).map((key) => ({ ...value[key], key })));
        });
    }

    /**
     * Read the value at `path` once, or null if nothing is there
     */
    async getOnce<T>(path: string): Promise<T | null> {
        const snapshot = await get(this.dbRef(path));
        return snapshot.val();
    }

    /**
     * Set the value of realtime db at `path`
     */
    set<T>(path: string, value: T) {
        return set(this.dbRef(path), value);
    }

    /**
     * Change only the given fields at `path`, leaving any other children untouched
     */
    update(path: string, value: object) {
        return update(this.dbRef(path), value);
    }

    remove(path: string) {
        return remove(this.dbRef(path));
    }

    getUrl(path: string) {
        return getDownloadURL(storageRef(this.storage, path));
    }

    getStorageRef(path: string) {
        return storageRef(this.storage, path);
    }
    upload = uploadBytes;

    push(path: string, value: any) {
        return push(this.dbRef(path), value);
    }

    dbRef(path: string) {
        return dbRef(this.db, path);
    }
}
