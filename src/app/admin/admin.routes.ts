import { Route } from '@angular/router';

import { AdminComponent } from './admin.component';
import { EditPostComponent } from './edit-post.component';

import { FirebaseApp, initializeApp } from 'firebase/app';

import { InjectionToken } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { EditablePostService } from './shared/editable-post.service';
import { FirebaseService } from './firebase.service';

export const BUCKET = new InjectionToken<string>('firebase.storageBucket');
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase.app');

export const AdminRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'prefix',
        providers: [
            { provide: BUCKET, useValue: 'fluindotio-website-93127.appspot.com' },
            {
                provide: FIREBASE_APP,
                useFactory: () => {
                    console.log('firebase app initializing...');
                    return initializeApp({
                        apiKey: 'AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI',
                        authDomain: 'fluindotio-website-93127.firebaseapp.com',
                        databaseURL: 'https://fluindotio-website-93127.firebaseio.com',
                        storageBucket: 'fluindotio-website-93127.appspot.com',
                    });
                },
            },
            FirebaseService,
            AuthService,
            EditablePostService,
        ],
        children: [
            { path: '', component: AdminComponent, data: { title: 'Admin' } },
            {
                path: 'image-generator',
                loadComponent: () => import('./image-generator/image-generator.component').then(m => m.ImageGeneratorComponent),
                data: { title: 'AI Image Generator' }
            },
            { path: ':id', component: EditPostComponent, data: { title: false } },
        ],
    },
];
