import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [NewsletterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: NewsletterComponent},
    ])
  ]
})
export class NewsletterModule { }
