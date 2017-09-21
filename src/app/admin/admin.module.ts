import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule, MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

import { AdminComponent } from './admin.component';
import { UploadComponent } from './upload.component';
import { EditPostComponent } from './edit-post.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
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
            { path: '', component: AdminComponent, data: {title: 'Admin'} },
            { path: ':id', component: EditPostComponent, data: {title: false}  },
        ]),
        AngularFireModule.initializeApp({
            apiKey: 'AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI',
            authDomain: 'fluindotio-website-93127.firebaseapp.com',
            databaseURL: 'https://fluindotio-website-93127.firebaseio.com',
            storageBucket: 'fluindotio-website-93127.appspot.com',
        }),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        MatCardModule, MatInputModule,
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
        { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}
    ]
})
export class AdminModule { }
