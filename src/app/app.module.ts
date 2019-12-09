import { NgModule, ErrorHandler, DoBootstrap } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as firebase from 'firebase/app';
import 'firebase/performance';
import { AngularFireModule } from '@angular/fire';

import { PostService } from './shared/post.service';
import { AdminService } from './shared/admin.service';
import { FirebaseToolsModule } from './firebasetools/firebasetools.module';
import { routeConfig } from './app.routes';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'environments/environment';

import { NotFoundComponent } from './not-found.component';
import { Send404Component } from 'app/send-404.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';
import { EmbeddableModule } from './embeddable/embeddable.module';
import { BioComponent } from './pages/bio.component';

const fireConfig = {
    apiKey: 'AIzaSyAJawulOMYRp0eXjMHLqiffzuS9tToCfAI',
    authDomain: 'fluindotio-website-93127.firebaseapp.com',
    databaseURL: 'https://fluindotio-website-93127.firebaseio.com',
    storageBucket: 'fluindotio-website-93127.appspot.com',
};


@NgModule({
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        RouterModule.forRoot(routeConfig),
        HttpClientModule,
        FirebaseToolsModule,
        BrowserAnimationsModule,
        EmbeddableModule,
        AngularFireModule.initializeApp(fireConfig),
        //ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    ],
    declarations: [
        AppComponent,
        NotFoundComponent,
        HomeComponent,
        BlogComponent,
        BlogPostComponent,
        BioComponent,
        ProjectsComponent,
        Send404Component,
    ],
    bootstrap: [AppComponent],
    providers: [Title, PostService, AdminService],
})
export class AppModule  {
    constructor() {
        firebase.initializeApp(fireConfig);
        const perf = firebase.performance();
        console.log('firebase performance setup',perf);
    }
}
