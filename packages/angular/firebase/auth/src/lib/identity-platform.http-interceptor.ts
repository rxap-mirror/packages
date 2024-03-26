import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {
  inject,
  InjectionToken,
} from '@angular/core';
import {
  Auth,
  idToken,
} from '@angular/fire/auth';
import { isDefined } from '@rxap/rxjs';
import { coerceArray } from '@rxap/utilities';
import { Observable } from 'rxjs';
import {
  catchError,
  switchMap,
  tap,
} from 'rxjs/operators';

export const IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>(
  'identity-platform-http-interceptor-url-pattern');


export const IdentityPlatformHttpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

  const urlPattern: RegExp[] = coerceArray(
    inject(IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN, { optional: true }) ?? []);
  const auth = inject(Auth);

  const isMatch = (req: HttpRequest<any>) => {
    return urlPattern.some(pattern => req.url.match(pattern));
  };

  if (isMatch(req)) {
    return idToken(auth).pipe(
      tap(idTokenValue => {
        if (!idTokenValue) {
          throw new Error(
            `The isToken is not defined. Ensure that the user is logged in, before sending a request to '${ req.url }'`);
        }
      }),
      isDefined(),
      switchMap(idTokenValue => next(req.clone({
        setHeaders: {
          idToken: idTokenValue,
        },
      })).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              auth.signOut().then(() => location.reload());
            }
          }
          throw error;
        }),
      )),
    );
  }
  return next(req);

};

