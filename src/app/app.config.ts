import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { loaderInterceptor } from '../utilities/interceptors/loader.interceptor';
import { TokenInterceptor } from '../utilities/interceptors/token.interceptor';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { provideHighcharts } from 'highcharts-angular';

ModuleRegistry.registerModules([AllCommunityModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loaderInterceptor, TokenInterceptor])),
    provideNativeDateAdapter(),
    provideAnimations(),
    provideHighcharts(),
    DatePipe,
  ],
};
