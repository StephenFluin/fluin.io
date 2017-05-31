import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from './app-header.component';
import { PostListComponent } from './post-list.component';
import { FirebaseToolsModule } from 'app/firebasetools/firebasetools.module';

export const EmbedComponents = [AppHeaderComponent, PostListComponent];

@NgModule({
  declarations: EmbedComponents,
  imports: [CommonModule, RouterModule, FirebaseToolsModule],
  exports: [EmbedComponents],
  entryComponents: [EmbedComponents]
})
export class EmbeddableModule { }
