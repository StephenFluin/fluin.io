import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppShellModule } from '@angular/app-shell';
import { CommonAppModule } from './common-app.module';
import { FluinioAppComponent } from './fluinio.component';
import { AppHeaderComponent } from './app-header.component';

import { routeConfig } from './app.routes';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot([]),
        AppShellModule.runtime(),
        CommonAppModule,
    ],
    declarations: [
        AppHeaderComponent,
        FluinioAppComponent,
    ],
    bootstrap: [FluinioAppComponent],
})
export class AppModule { }
