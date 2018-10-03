import { NgModule } from '@angular/core';


import { AngularFireModule } from '@angular/fire';
import { RefirebasePipe } from './refirebase.pipe';

@NgModule({
    exports: [
       RefirebasePipe,
    ],
    declarations: [
        RefirebasePipe,
    ],
})
export class FirebaseToolsModule { }
