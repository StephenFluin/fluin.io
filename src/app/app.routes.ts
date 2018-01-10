import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { ProjectsComponent } from './pages/projects.component';
import { NotFoundComponent } from 'app/not-found.component';
import { Send404Component } from 'app/send-404.component';

export const routeConfig: Routes = [
    { path: '', component: HomeComponent, data: { title: 'fluin.io', page: 'home' } },
    {
        path: 'blog', data: { title: false, page: 'blog'  }, component: BlogComponent, children: [
            { path: '', component: BlogPostComponent },
            { path: ':id', component: BlogPostComponent },
        ]
    },
    { path: 'bio', component: BioComponent, data: { title: 'About Stephen Fluin' } },
    { path: 'projects', component: ProjectsComponent, data: { title: 'Projects' } },
    { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
    { path: '404', component: NotFoundComponent},
    { path: '**', component: Send404Component },
];
