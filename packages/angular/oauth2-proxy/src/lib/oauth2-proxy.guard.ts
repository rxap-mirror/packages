import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import {
  catchError,
  firstValueFrom,
  map,
  of,
} from 'rxjs';

export const oauth2ProxyGuard: CanActivateFn = async () => {

  const http = inject(HttpClient);

  const isAuthenticated = await firstValueFrom(http.get('/oauth2/auth').pipe(
    map(() => true),
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          return of(false);
        }
      }
      throw error;
    }),
  ));

  if (!isAuthenticated) {
    location.replace(location.origin + '/oauth2/sign_in');
  }

  return isAuthenticated;

};
