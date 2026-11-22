import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import {
  inject,
  InjectionToken,
} from '@angular/core';
import { FIREBASE_AUTH } from '@rxap/firebase';
import {
  Auth,
  onIdTokenChanged,
} from 'firebase/auth';
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


/**
 * Emits the id token of the current user (or null) on subscription and every time the id token changes.
 */
export function idToken(auth: Auth): Observable<string | null> {
  return new Observable<string | null>(subscriber => onIdTokenChanged(
    auth,
    user => {
      if (!user) {
        subscriber.next(null);
        return;
      }
      user.getIdToken().then(token => subscriber.next(token), error => subscriber.error(error));
    },
    error => subscriber.error(error),
    () => subscriber.complete(),
  ));
}

export const IdentityPlatformHttpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

  const urlPattern: RegExp[] = coerceArray(
    inject(IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN, { optional: true }) ?? []);
  const auth: Auth = inject(FIREBASE_AUTH);

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
          idToken: idTokenValue as string,
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

