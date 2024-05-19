import { Inject, Injectable, signal } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { User, getAuth } from 'firebase/auth';
import { ref as dbRef, getDatabase, onValue, push, set } from 'firebase/database';
import { StorageReference, getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { FIREBASE_APP } from './admin.routes';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    db = getDatabase(this.fbApp);
    storage = getStorage(this.fbApp);
    auth = getAuth(this.fbApp);
    authState = signal<User | null>(null);

    constructor(@Inject(FIREBASE_APP) private fbApp: FirebaseApp) {
        this.auth.onAuthStateChanged((user) => {
            this.authState.set(user);
        });
    }

    /**
     * Get a signal with an array of objects from a path in the realtime db
     * @param path Location in realtime db
     * @returns
     */
    list<T>(path: string) {
        const result = signal<T[] | null>(null);
        onValue(this.dbRef(path), (snapshot) => {
            const newList = [];
            for (const key of Object.keys(snapshot.val())) {
                const details = snapshot.val()[key];
                const item = { ...details, key };
                newList.push(item);
            }
            result.set(newList);
        });
        return result;
    }

    /**
     * Set the value of realtime db at `path`
     */
    set<T>(path: string, value: T) {
        return set(this.dbRef(path), value);
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
