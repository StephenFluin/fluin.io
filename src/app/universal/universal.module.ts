import {NgModule, ModuleWithProviders} from '@angular/core';
import {APP_BASE_HREF} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AppShellModule} from '@angular/app-shell';
import {UniversalModule} from 'angular2-universal';
import {FluinioAppComponent} from '../fluinio.component';
import {CommonAppModule} from '../common-app.module';

@NgModule({
  bootstrap: [FluinioAppComponent],
  imports: [
    CommonAppModule,
    RouterModule.forRoot([]),
    UniversalModule.withConfig({
      originUrl: 'http://localhost:8080',
      requestUrl: '/',
    }) as any as ModuleWithProviders,
    AppShellModule.prerender()
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'},
  ]
})
export class UniversalAppModule {}