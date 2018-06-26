import { NgModule } from '@angular/core';


import { AngularFireModule } from 'angularfire2';
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
