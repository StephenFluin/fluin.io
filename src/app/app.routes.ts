import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
        title: 'Stephen Fluin · Helping developers ship faster',
    },
    {
        path: 'blog',
        loadComponent: () => import('./pages/blog.component').then((m) => m.BlogComponent),
        title: 'Blog | fluin.io',
        data: {
            description:
                'Stephen Fluin on building real products with AI coding agents: what worked, what broke, and why.',
        },
        children: [
            { path: '', loadComponent: () => import('./no-blog.component').then((m) => m.NoBlogComponent) },
            { path: ':id', loadComponent: () => import('./pages/blog-post.component').then((m) => m.BlogPostComponent) },
        ],
    },
    {
        path: 'bio',
        loadComponent: () => import('./pages/bio.component').then((m) => m.BioComponent),
        title: 'About Stephen Fluin | fluin.io',
        data: {
            description:
                'Stephen Fluin is Head of DevRel at Buildkite, a former Angular core team member, and an Angular GDE who has spent his career helping developers ship faster.',
        },
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects.component').then((m) => m.ProjectsComponent),
        title: 'Projects | fluin.io',
        data: {
            description:
                'Apps and experiments built and maintained by Stephen Fluin, mostly with Angular and Firebase, and what each one is built with.',
        },
    },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.AdminRoutes) },
    {
        path: 'newsletter',
        loadChildren: () => import('./newsletter/newsletter.routes').then((m) => m.routes),
    },
    { path: '**', loadComponent: () => import('./not-found.component').then((m) => m.NotFoundComponent) },
];
