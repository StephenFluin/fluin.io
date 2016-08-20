import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AdminComponent } from './admin.component';

import { AngularFireModule } from 'angularfire2';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule.forChild([
            // path should be '' in Lazy loading, 'admin' in not
            { path: 'admin', component: AdminComponent }
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
    ],
})
export class AdminModule { }