import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, { providers: [provideZoneChangeDetection(),...config.providers, provideNoopAnimations()] }, context);

export default bootstrap;
