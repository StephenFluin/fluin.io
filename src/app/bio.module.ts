import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { BioComponent } from './pages/bio.component';

import { routeConfig } from './routes';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        RouterModule.forChild([
            { path: '', component: BioComponent}
        ])
    ],
    declarations: [
        BioComponent,
    ],
})
export class BioModule {}