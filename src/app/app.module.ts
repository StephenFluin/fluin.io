import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { PostService } from './shared/post.service';

import { FluinioAppComponent } from './fluinio.component';
import { AppHeaderComponent } from './app-header.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

// routes
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';
import { TalksComponent } from './pages/talks.component';

import { BioComponent } from './pages/bio.component';
//import { AdminzModule } from './admin/admin.module';
import { routeConfig } from './app.routes';

// Pipes
import { FirebaseToolsModule } from './firebasetools/firebasetools.module';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routeConfig),
        HttpModule,
        FirebaseToolsModule,
    ],
    declarations: [
        AppHeaderComponent,
        FluinioAppComponent,
        HomeComponent,
        BlogComponent,
        TalksComponent,
        BlogHomeComponent,
        BlogPostComponent,
        BioComponent,
        ProjectsComponent,
    ],
    bootstrap: [FluinioAppComponent],
    providers: [
        Title, 
        PostService
    ],
})
export class AppModule {}
