import { RouterConfig } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BioComponent } from './pages/bio.component';
import { SpeakingComponent } from './pages/speaking.component';

export const routeConfig : RouterConfig = [
    {path: '', component: HomeComponent},
    {path: 'blog', component: BlogComponent},
    {path: 'bio', component: BioComponent},
    {path: 'speaking', component: SpeakingComponent},

]