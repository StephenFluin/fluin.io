import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AdminComponent } from './admin.component';
import { UploadComponent } from './upload.component';

import { AngularFireModule } from 'angularfire2';
import { AuthService } from './shared/auth.service';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forChild([
            // path should be '' in Lazy loading, 'admin' in not
            { path: '', component: AdminComponent },
            { path: 'upload', component: UploadComponent },
        ]),
        AngularFireModule.initializeApp({
            apiKey: "AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI",
            authDomain: "fluindotio-website-93127.firebaseapp.com",
            databaseURL: "https://fluindotio-website-93127.firebaseio.com",
            storageBucket: "fluindotio-website-93127.appspot.com",
        })
    ],
    declarations: [
        AdminComponent,
        UploadComponent,
    ],
    providers: [
        AuthService
    ]
})
export class AdminModule { }