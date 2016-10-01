import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { ProjectsComponent } from './pages/projects.component';
import { TalksComponent } from './pages/talks.component';

export const routeConfig: Routes = [
    { path: '', component: HomeComponent, data: {title: "fluin.io"} },
    {
        path: 'blog', component: BlogComponent, data: {title: false}, children: [
            { path: '', component: BlogPostComponent },
            { path: ':id', component: BlogPostComponent },
        ]
    },
    { path: 'bio', component: BioComponent,  data: {title: 'About Stephen Fluin'}},
    { path: 'projects', component: ProjectsComponent, data: {title: 'Projects'} },
    { path: 'talks', component: TalksComponent, data: {title: 'Talks'} },
    { path: 'admin', loadChildren: "app/admin/admin.module#AdminModule" },
];