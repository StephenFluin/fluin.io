import { RouterConfig } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { ProjectsComponent } from './pages/projects.component';
import { SpeakingComponent } from './pages/speaking.component';

export const routeConfig : RouterConfig = [
    {path: '', component: HomeComponent},
    {path: 'blog',  component: BlogComponent, children: [
        {path: '', component: BlogHomeComponent},
        {path: ':id', component: BlogPostComponent},
    ]},
    {path: 'bio', component: BioComponent},
    {path: 'projects', component: ProjectsComponent},
    {path: 'speaking', component: SpeakingComponent},

]