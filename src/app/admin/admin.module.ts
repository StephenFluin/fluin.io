import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { MdCardModule } from '@angular2-material/card';
import { MdInputModule } from '@angular2-material/input';


import { AdminComponent } from './admin.component';
import { UploadComponent } from './upload.component';
import { EditPostComponent } from './edit-post.component';

import { AngularFireModule } from 'angularfire2';
import { AuthService } from './shared/auth.service';
import { EditablePostService } from './shared/editable-post.service';
import { FirebaseToolsModule } from '../firebasetools/firebasetools.module';
import { AppModule } from '../app.module';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forChild([
            // path should be '' in Lazy loading, 'admin' in not
            { path: '', component: AdminComponent },
            { path: 'upload', component: UploadComponent },
            { path: ':id', component: EditPostComponent },
        ]),
        AngularFireModule.initializeApp({
            apiKey: "AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI",
            authDomain: "fluindotio-website-93127.firebaseapp.com",
            databaseURL: "https://fluindotio-website-93127.firebaseio.com",
            storageBucket: "fluindotio-website-93127.appspot.com",
        }),
        MdCardModule,
        MdInputModule,
        FirebaseToolsModule,
    ],
    declarations: [
        AdminComponent,
        UploadComponent,
        EditPostComponent,
    ],
    providers: [
        AuthService,
        EditablePostService,
    ]
})
export class AdminModule { }