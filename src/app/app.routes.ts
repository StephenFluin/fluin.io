import { Routes } from '@angular/router';

import { NoBlogComponent } from './no-blog.component';
import { NotFoundComponent } from './not-found.component';
import { BioComponent } from './pages/bio.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BlogComponent } from './pages/blog.component';
import { HomeComponent } from './pages/home.component';
import { ProjectsComponent } from './pages/projects.component';
import { Send404Component } from './send-404.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, data: { title: 'fluin.io', page: 'home' } },
    {
        path: 'blog',
        data: { title: false, page: 'blog' },
        component: BlogComponent,
        children: [
            { path: '', component: NoBlogComponent },
            { path: ':id', component: BlogPostComponent },
        ],
    },
    { path: 'bio', component: BioComponent, data: { title: 'About Stephen Fluin' } },
    { path: 'projects', component: ProjectsComponent, data: { title: 'Projects' } },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.AdminRoutes) },
    {
        path: 'newsletter',
        loadChildren: () => import('./newsletter/newsletter.routes').then((m) => m.routes),
    },
    { path: '404', component: NotFoundComponent },
    { path: '**', component: Send404Component },
];
