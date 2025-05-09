import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

const bootstrap = () =>
    bootstrapApplication(AppComponent, { providers: [...config.providers, provideNoopAnimations()] });

export default bootstrap;
