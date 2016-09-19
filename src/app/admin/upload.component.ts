import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { Observable } from 'rxjs';

declare var firebase: any;

@Component({
    selector: 'app-upload',
    template: `
  <h2>Upload a File</h2>
  <form ngNoForm>
    Folder: <input [(ngModel)]="folder" [value]="folder"><br/>
    <input id="file" name="file" type="file" >
    <button (click)="upload()" type="button">Upload</button>
    </form>

    <h2>File Gallery</h2>
    <div *ngFor="let img of imageList | async">
        <img [src]="img" style="max-width:100px;max-height:100px;">
    </div>
  `,
})
export class UploadComponent {
    folder: string = "2016-09";
    fileList : FirebaseListObservable<{path: string, filename?: string}[]>;
    imageList : Observable<string[]>;

    constructor(public af: AngularFire, public router: Router) {
        //firebase.initializeApp(af.firebaseConfig);
        
        var storage = firebase.storage();

        this.fileList = af.database.list('/articles/images');
        this.imageList = this.fileList.mergeMap( images => {
            return Observable.fromPromise(Promise.all(images.map(item => {
                var pathReference = storage.ref(item.path);
                let result = pathReference.getDownloadURL();
                return result;
            })));
        });
    }


    upload() {
        // Create a root reference
        var storageRef = firebase.storage().ref();

        let success = false;
        // This currently only grabs item 0, TODO refactor it to grab them all
        for (let selectedFile of [(<HTMLInputElement>document.getElementById('file')).files[0]]) {
            console.log(selectedFile);
            // Make local copies of services because "this" will be clobbered
            let router = this.router;
            let af = this.af;
            let path = 'articles/' + this.folder + '/' + selectedFile.name;
            var iRef = storageRef.child(path);
            iRef.put(selectedFile).then(function (snapshot) {
                console.log('Uploaded a blob or file!');
                af.database.list("/articles/images/").push({ path: path, filename: selectedFile.name })
                router.navigateByUrl('/admin');

            });
        }
        
    }
}
