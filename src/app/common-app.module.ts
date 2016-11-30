import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppShellModule } from '@angular/app-shell';

import { PostService } from './shared/post.service';
import { TalkService } from './shared/talk.service';


import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';

// routes
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { ProjectsComponent } from './pages/projects.component';
import { TalksComponent } from './pages/talks.component';
import { TalkViewComponent } from './pages/talk-view.component';

import { BioComponent } from './pages/bio.component';
//import { AdminzModule } from './admin/admin.module';
import { routeConfig } from './app.routes';

// Pipes
import { FirebaseToolsModule } from './firebasetools/firebasetools.module';

@NgModule({
    imports: [
        CommonModule,
        AppShellModule,
        RouterModule.forChild(routeConfig),
        HttpModule,
        FirebaseToolsModule,
        
    ],
    declarations: [
        HomeComponent,
        BlogComponent,
        TalksComponent,
        TalkViewComponent,
        BlogHomeComponent,
        BlogPostComponent,
        BioComponent,
        ProjectsComponent,
    ],
    providers: [
        Title,
        PostService,
        TalkService,
    ],
})
export class CommonAppModule { }
