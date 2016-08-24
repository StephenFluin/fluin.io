import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { BioComponent } from './pages/bio.component';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule.forChild([
            { path: 'bio', component: BioComponent}
        ])
    ],
    declarations: [
        BioComponent,
    ],
})
export class BioModule {}