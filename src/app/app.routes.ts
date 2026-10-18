import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
        title: 'fluin.io - Stephen Fluin. CPO, Product, DevRel, Speaker, and more',
    },
    {
        path: 'blog',
        loadComponent: () => import('./pages/blog.component').then((m) => m.BlogComponent),
        data: {
            description:
                'Stephen Fluin writing about Angular, web performance, product, developer relations, and developer tools.',
        },
        children: [
            { path: '', loadComponent: () => import('./no-blog.component').then((m) => m.NoBlogComponent) },
            { path: ':id', loadComponent: () => import('./pages/blog-post.component').then((m) => m.BlogPostComponent) },
        ],
    },
    {
        path: 'bio',
        loadComponent: () => import('./pages/bio.component').then((m) => m.BioComponent),
        title: 'About Stephen Fluin',
        data: {
            description:
                'Stephen Fluin is VP of Product at HeroDevs, a former Angular core team member, and an Angular GDE with ~25 years building software at Google, Trello, Chainlink Labs, and more.',
        },
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects.component').then((m) => m.ProjectsComponent),
        title: 'Projects',
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
