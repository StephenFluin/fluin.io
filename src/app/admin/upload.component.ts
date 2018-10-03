import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { keyify } from './shared/keyify.operator';

export interface Image {
    path: string;
    filename: string;
    downloadURL?: string;
}

@Component({
    selector: 'image-upload',
    template: `
  <h2>Upload a File</h2>
  <form ngNoForm>
    <input id="file" name="file" type="file" >
    <button (click)="upload()" type="button">Upload</button>
    </form>

    <h2>File Gallery</h2>
    <div style="overflow:hidden;">
        <div *ngFor="let img of imageList | async"
            style="position:relative;width:100px;height:100px;float:left;display:flex;justify-content:center;align-items:center;">
            <img *ngIf="img && img.downloadURL && img.downloadURL | async"
                [src]="img.downloadURL | async"
                style="max-width:100px;max-height:100px;">

            <button (click)="delete(img)" style="position:absolute;top:2px;right:2px;">[x]</button>
        </div>
    </div>
  `,
})
export class UploadComponent implements OnChanges {
    /**
     * The name of the folder for images
     * eg. posts/angular-is-awesome
     */
    @Input() folder: string;

    fileList: AngularFireList<Image>;
    imageList: Observable<any>;

    constructor(public db: AngularFireDatabase, public router: Router) {}

    ngOnChanges() {
        console.log('new values for folder');
        const storage = firebase.storage();

        this.fileList = this.db.list<Image>(`/${this.folder}/images`);
        this.imageList = this.fileList.snapshotChanges().pipe(
            keyify,
            map(itemList =>
                itemList.map(item => {
                    const pathReference = storage.ref(item.path);
                    const result = { $key: item.key, path: item.path, downloadURL: null, filename: item.filename };
                    // This Promise must be wrapped in Promise.resolve because the thennable from
                    // firebase isn't monkeypatched by zones and therefore doesn't trigger CD
                    result.downloadURL = Promise.resolve(pathReference.getDownloadURL());

                    return result;
                })
            )
        );
    }

    upload() {
        // Create a root reference
        const storageRef = firebase.storage().ref();

        const success = false;

        if ((<HTMLInputElement>document.getElementById('file')).files.length <= 0) {
            console.log('No files found to upload.');
            return;
        }

        // This currently only grabs item 0, TODO refactor it to grab them all
        for (const selectedFile of [(<HTMLInputElement>document.getElementById('file')).files[0]]) {
            console.log(selectedFile);
            // Make local copies of services because "this" will be clobbered
            const router = this.router;
            const folder = this.folder;
            const path = `/${this.folder}/${selectedFile.name}`;
            const iRef = storageRef.child(path);
            const db = this.db;
            // cache files for up to a week
            iRef.put(selectedFile, { cacheControl: 'max-age=604800' }).then(snapshot => {
                console.log('Uploaded a blob or file! Now storing the reference at', `/${this.folder}/images/`);
                db.list(`/${folder}/images/`).push({ path: path, filename: selectedFile.name });
            });
        }
    }
    delete(image: Image & { key: string }) {
        const storagePath = image.path;
        const referencePath = `${this.folder}/images/` + image.key;

        // Do these as two separate steps so you can still try delete ref if file no longer exists

        // Delete from Storage
        firebase
            .storage()
            .ref()
            .child(storagePath)
            .delete()
            .then(() => {}, error => console.error('Error deleting stored file', storagePath));

        // Delete references
        this.db.object(referencePath).remove();
    }
}
