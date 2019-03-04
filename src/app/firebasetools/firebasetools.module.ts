import { NgModule } from '@angular/core';
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
