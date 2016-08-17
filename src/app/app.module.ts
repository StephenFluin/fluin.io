import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

import { BioModule } from './bio.module';
import { BioComponent } from './pages/bio.component';

import { routeConfig } from './routes';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routeConfig),
        HttpModule,
        BioModule,
    ],
    declarations: [
        FluinioAppComponent,
        AppHeaderComponent,
        HomeComponent,
        BlogComponent,
        SpeakingComponent,
        BlogHomeComponent,
        BlogPostComponent,
        ProjectsComponent,
        SpeakingComponent,
    ],
    bootstrap: [FluinioAppComponent]
})
export class AppModule {}