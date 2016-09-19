import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { ProjectsComponent } from './pages/projects.component';
import { SpeakingComponent } from './pages/speaking.component';

export const routeConfig: Routes = [
    { path: '', component: HomeComponent, data: {title: "Home"} },
    {
        path: 'blog', component: BlogComponent, data: {title: 'Blog'}, children: [
            { path: '', component: BlogPostComponent },
            { path: ':id', component: BlogPostComponent },
        ]
    },
    { path: 'bio', component: BioComponent,  data: {title: 'About Stephen Fluin'}},
    { path: 'projects', component: ProjectsComponent, data: {title: 'Projects'} },
    { path: 'speaking', component: SpeakingComponent, data: {title: 'Speaking'} },
    { path: 'admin', loadChildren: "app/admin/admin.module#AdminModule" },
];