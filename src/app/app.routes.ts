import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
        data: { title: 'fluin.io - Stephen Fluin. CPO, Product, DevRel, Speaker, and more', page: 'home', preload: true },
    },
    {
        path: 'blog',
        data: { title: false, page: 'blog', preload: true },
        loadComponent: () => import('./pages/blog.component').then((m) => m.BlogComponent),
        children: [
            { path: '', loadComponent: () => import('./no-blog.component').then((m) => m.NoBlogComponent) },
            { path: ':id', loadComponent: () => import('./pages/blog-post.component').then((m) => m.BlogPostComponent) },
        ],
    },
    {
        path: 'bio',
        loadComponent: () => import('./pages/bio.component').then((m) => m.BioComponent),
        data: { title: 'About Stephen Fluin', preload: true },
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects.component').then((m) => m.ProjectsComponent),
        data: { title: 'Projects', preload: true },
    },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.AdminRoutes) },
    {
        path: 'newsletter',
        loadChildren: () => import('./newsletter/newsletter.routes').then((m) => m.routes),
    },
    { path: '404', loadComponent: () => import('./not-found.component').then((m) => m.NotFoundComponent) },
    { path: '**', loadComponent: () => import('./send-404.component').then((m) => m.Send404Component) },
];
