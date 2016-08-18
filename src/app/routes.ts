import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BlogHomeComponent } from './pages/blog-home.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { BioComponent } from './pages/bio.component';
import { BioModule } from './bio.module';
import { ProjectsComponent } from './pages/projects.component';
import { SpeakingComponent } from './pages/speaking.component';

export const routeConfig : Routes = [
    {path: '', component: HomeComponent},
    {path: 'blog',  component: BlogComponent, children: [
        {path: '', component: BlogPostComponent},
        {path: ':id', component: BlogPostComponent},
    ]},
    // Leave this out until Lazy loading works
    //{path: 'bio', loadChildren: "./bio.module#BioModule"},
    {path: 'projects', component: ProjectsComponent},
    {path: 'speaking', component: SpeakingComponent},

]