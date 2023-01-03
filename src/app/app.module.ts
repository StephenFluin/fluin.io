import { NgModule } from '@angular/core';

import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { PostService } from './shared/post.service';
import { AdminService } from './shared/admin.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// routes
import { NotFoundComponent } from './not-found.component';
import { Send404Component } from 'app/send-404.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';

import { EmbeddableModule } from './embeddable/embeddable.module';

import { BioComponent } from './pages/bio.component';
import { routeConfig } from './app.routes';

// Pipes
import { FirebaseToolsModule } from './firebasetools/firebasetools.module';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        RouterModule.forRoot(routeConfig, {}),
        HttpClientModule,
        FirebaseToolsModule,
        BrowserAnimationsModule,
        EmbeddableModule,
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
    providers: [
        Title,
        PostService,
        AdminService,
    ],
})
export class AppModule {}
