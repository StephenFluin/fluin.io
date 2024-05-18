import { Component, Input, OnChanges, Signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { remove as deleteDB } from 'firebase/database';
import { deleteObject as deleteStorage } from 'firebase/storage';
import { FirebaseService } from './firebase.service';

export interface Image {
    /** The full fb storage path */
    path: string;
    /** Just the name of the file */
    filename: string;
    /** A promise with a download or <img> url */
    downloadURL?: Promise<string>;
    /** The key where it's stored in the DB */
    key?: string;
}

@Component({
    selector: 'image-upload',
    template: `
        <h2>Upload a File</h2>
        <form ngNoForm>
            <input id="file" name="file" type="file" />
            <button (click)="upload()" type="button">Upload</button>
        </form>

        <h2>File Gallery</h2>
        <div style="overflow:hidden;">
            <div
                *ngFor="let img of imageList()"
                style="position:relative;width:100px;height:100px;float:left;display:flex;justify-content:center;align-items:center;"
            >
                <img
                    *ngIf="img && img.downloadURL && img.downloadURL"
                    [src]="img.downloadURL | async"
                    alt="uploaded image"
                    style="max-width:100px;max-height:100px;"
                />
                <button (click)="delete(img)" style="position:absolute;top:2px;right:2px;">[x]</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [NgFor, NgIf, AsyncPipe],
})
export class UploadComponent implements OnChanges {
    /**
     * The name of the folder for images
     * eg. posts/angular-is-awesome
     */
    @Input() folder: string;

    // List of files from realtime DB
    fileList: Signal<Image[]>;
    // List of files with downloadURLs
    imageList: Signal<Image[]>;

    constructor(public firebaseService: FirebaseService, public router: Router) {}

    ngOnChanges() {
        console.log('new values for folder');
        this.fileList = this.firebaseService.list<Image>(`/${this.folder}/images`);

        /** Generate download URLs as promises */
        this.imageList = computed(() => {
            return this.fileList().map((item) => {
                item.downloadURL = this.firebaseService.getUrl(item.path);
                return item;
            });
        });
    }

    /**
     * User has picked a file. We'll store it in
     *  FB storage as /posts/post-id/filename.jpg
     * then remember we have it in
     * DB storage as /posts/post-id/images/<key>/{path: /posts/post-id/, filename: filename.jpg}
     */
    upload() {
        const success = false;

        if ((<HTMLInputElement>document.getElementById('file')).files.length <= 0) {
            console.log('No files found to upload.');
            return;
        }

        // This currently only grabs item 0, TODO refactor it to grab them all
        for (const selectedFile of [(<HTMLInputElement>document.getElementById('file')).files[0]]) {
            console.log(selectedFile);
            // Make local copies of services because "this" will be clobbered
            const folder = this.folder;
            const path = `/${this.folder}/${selectedFile.name}`;
            const uploadRef = this.firebaseService.getStorageRef(path);

            // cache files for up to a week
            this.firebaseService
                .upload(uploadRef, selectedFile, { cacheControl: 'max-age=604800' })
                .then((snapshot) => {
                    console.log('Uploaded a blob or file! Now storing the reference at', `/${this.folder}/images/`);
                    this.firebaseService.push(`/${folder}/images/`, { path: path, filename: selectedFile.name });
                });
        }

        // @TODO should we be saving the download URL before we save it to DB?
    }

    delete(image: Image) {
        const storagePath = image.path;
        const dbPath = `${this.folder}/images/` + image.key;

        // Do these as two separate steps so you can still try delete ref if file no longer exists

        deleteDB(this.firebaseService.dbRef(dbPath)).catch((error) =>
            console.error('Error deleting memory of stored file', dbPath, error)
        );

        deleteStorage(this.firebaseService.getStorageRef(storagePath)).catch((error) => {
            console.error('Error deleting file from storage', storagePath, error);
        });
    }
}
