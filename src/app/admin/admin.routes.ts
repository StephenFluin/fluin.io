import { importProvidersFrom } from '@angular/core';
import { Route } from '@angular/router';

import { AdminComponent } from './admin.component';
import { EditPostComponent } from './edit-post.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AuthService } from './shared/auth.service';
import { EditablePostService } from './shared/editable-post.service';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule, BUCKET } from '@angular/fire/compat/storage';

export const AdminRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'prefix',
        providers: [
            { provide: BUCKET, useValue: 'fluindotio-website-93127.appspot.com' },
            importProvidersFrom([
                AngularFireModule.initializeApp({
                    apiKey: 'AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI',
                    authDomain: 'fluindotio-website-93127.firebaseapp.com',
                    databaseURL: 'https://fluindotio-website-93127.firebaseio.com',
                    storageBucket: 'fluindotio-website-93127.appspot.com',
                }),
                AngularFireAuthModule,
                AngularFireDatabaseModule,
                AngularFireStorageModule,
            ]),
            AuthService,
            EditablePostService,
        ],
        children: [
            { path: '', component: AdminComponent, data: { title: 'Admin' } },
            { path: ':id', component: EditPostComponent, data: { title: false } },
        ],
    },
];
