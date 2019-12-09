import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { AdminComponent } from './admin.component';
import { UploadComponent } from './upload.component';
import { EditPostComponent } from './edit-post.component';

import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AuthService } from './shared/auth.service';
import { EditablePostService } from './shared/editable-post.service';
import { FirebaseToolsModule } from '../firebasetools/firebasetools.module';
import { AngularFireAuthModule } from '@angular/fire/auth';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([
            // path should be '' in Lazy loading, 'admin' in not
            { path: '', component: AdminComponent, data: { title: 'Admin' } },
            { path: ':id', component: EditPostComponent, data: { title: false } },
        ]),
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        MatCardModule,
        MatInputModule,
        FirebaseToolsModule,
    ],
    declarations: [AdminComponent, UploadComponent, EditPostComponent],
    providers: [AuthService, EditablePostService],
})
export class AdminModule { }
