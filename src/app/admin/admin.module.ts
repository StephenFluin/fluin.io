import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { AdminComponent } from './admin.component';
import { UploadComponent } from './upload.component';
import { EditPostComponent } from './edit-post.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AuthService } from './shared/auth.service';
import 'firebase/database';
import { EditablePostService } from './shared/editable-post.service';
import { FirebaseToolsModule } from '../firebasetools/firebasetools.module';
import { AngularFireAuthModule } from '@angular/fire/auth';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([
            // path should be '' in Lazy loading, 'admin' in not
            { path: '', component: AdminComponent, data: { title: 'Admin' } },
            { path: ':id', component: EditPostComponent, data: { title: false } },
        ]),
        AngularFireModule.initializeApp({
            apiKey: "AIzaSyBEIvjGfRE7LKKNAKjrtAwj8Zjo-wO6i10",
            authDomain: "ng-fluin-io.firebaseapp.com",
            databaseURL: "https://ng-fluin-io-default-rtdb.firebaseio.com",
            projectId: "ng-fluin-io",
            storageBucket: "ng-fluin-io.appspot.com",
            messagingSenderId: "277444686503",
            appId: "1:277444686503:web:859c8df15b3b80f13ae182",
            measurementId: "G-3652E47TGF"
          }),
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        MatCardModule,
        MatInputModule,
        FirebaseToolsModule,
    ],
    declarations: [AdminComponent, UploadComponent, EditPostComponent],
    providers: [AuthService, EditablePostService],
})
export class AdminModule { }
