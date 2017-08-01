import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { ProjectsComponent } from './pages/projects.component';
import { TalksComponent } from './pages/talks.component';
import { TalkViewComponent } from './pages/talk-view.component';

export const routeConfig: Routes = [
    { path: '', component: HomeComponent, data: { title: 'fluin.io', depth: 1 } },
    {
        path: 'blog', data: { title: false, depth: 2 }, component: BlogComponent, children: [
            { path: '', component: BlogPostComponent },
            { path: ':id', component: BlogPostComponent },
        ]
    },
    { path: 'bio', component: BioComponent, data: { title: 'About Stephen Fluin' } },
    { path: 'projects', component: ProjectsComponent, data: { title: 'Projects' } },
    {
        path: 'talks', children: [
            { path: '', component: TalksComponent, data: { title: 'Talks' } },
            { path: ':id', component: TalkViewComponent, data: { title: false } },
        ]
    },
    { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
];
