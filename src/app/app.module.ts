import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { FluinioAppComponent } from './fluinio.component';
import { AppHeaderComponent } from './app-header.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

// routes
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';
import { SpeakingComponent } from './pages/speaking.component';

import { BioComponent } from './pages/bio.component';
import { AdminModule } from './admin/admin.module';
import { routeConfig } from './app.routes';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routeConfig),
        HttpModule,
        // Add this when not lazy loading
        AdminModule,
    ],
    declarations: [
        AppHeaderComponent,
        FluinioAppComponent,
        HomeComponent,
        BlogComponent,
        SpeakingComponent,
        BlogHomeComponent,
        BlogPostComponent,
        BioComponent,
        ProjectsComponent,
        SpeakingComponent,
    ],
    bootstrap: [FluinioAppComponent],
    providers: [Title],
})
export class AppModule {}
