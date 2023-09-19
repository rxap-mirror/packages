import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  switchMap,
  take,
} from 'rxjs';
import { RXAP_AUTHENTICATION_ACCESS_TOKEN } from './tokens';

export function BearerTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  const accessToken$ = inject(RXAP_AUTHENTICATION_ACCESS_TOKEN);

  if (req.url.match(/https?:\/\/[^/]+\/api/)) {
    return accessToken$.pipe(
      take(1),
      switchMap(accessToken => {
        if (accessToken && (accessToken.valid === undefined || accessToken.valid)) {
          console.debug('Add access token to request', req.url);
          return next(req.clone({
            setHeaders: {
              Authorization: `Bearer ${ accessToken.token }`,
            },
          }));
        } else {
          console.debug('No valid access token found!', req.url);
        }
        return next(req);
      }),
    );
  } else {
    console.debug('Skip adding access token to request', req.url);
  }

  return next(req);

}
