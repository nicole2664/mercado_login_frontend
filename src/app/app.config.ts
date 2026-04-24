import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { httpErrorInterceptor } from './core/api/http/http-error.interceptor';
import { authInterceptor } from './core/api/http/auth.interceptor';
import { tokenInterceptor } from './core/api/http/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([tokenInterceptor, authInterceptor, httpErrorInterceptor]),
    ),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
