import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { FluinioAppComponent } from './fluinio.component';
import { AppHeaderComponent } from './app-header.component';
import { HomeComponent } from './pages/home.component';
import { BlogComponent } from './pages/blog.component';
import { BioComponent } from './pages/bio.component';
import { SpeakingComponent } from './pages/speaking.component';

import { routeConfig } from './routes';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routeConfig),
        HttpModule,
    ],
    declarations: [
        FluinioAppComponent,
        AppHeaderComponent,
        HomeComponent,
        BlogComponent,
        BioComponent,
        SpeakingComponent,
    ],
    bootstrap: [FluinioAppComponent]
})
export class AppModule {}