import { NgModule, ErrorHandler } from '@angular/core';

import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { PostService } from './shared/post.service';
import { AdminService } from './shared/admin.service';

import { FluinioAppComponent } from './fluinio.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

// routes
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';

import { EmbeddableModule } from './embeddable/embeddable.module';

import { BioComponent } from './pages/bio.component';
import { routeConfig } from './app.routes';

// Pipes
import { FirebaseToolsModule } from './firebasetools/firebasetools.module';
import { environment } from 'environments/environment';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routeConfig),
        HttpClientModule,
        FirebaseToolsModule,
        BrowserAnimationsModule,
        EmbeddableModule,
        environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    ],
    declarations: [
        FluinioAppComponent,
        HomeComponent,
        BlogComponent,
        BlogPostComponent,
        BioComponent,
        ProjectsComponent,
    ],
    bootstrap: [FluinioAppComponent],
    providers: [
        Title,
        PostService,
        AdminService,
    ],
})
export class AppModule { }

