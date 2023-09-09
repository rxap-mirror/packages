import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';

import {
  from,
  Observable,
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { KeycloakService } from '../services/keycloak.service';

export function KeycloakBearerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const keycloak = inject(KeycloakService);

  if (!keycloak.enableBearerInterceptor) {
    return next(req);
  }

  const shallPass: boolean =
    keycloak.excludedUrls.findIndex((item) => {
      const httpTest =
        !item.httpMethods?.length ||
        item.httpMethods.join().indexOf(req.method.toUpperCase()) > -1;

      const urlTest = item.urlPattern.test(req.url);

      return httpTest && urlTest;
    }) !== -1;

  if (shallPass) {
    return next(req);
  }

  return from(keycloak.isLoggedIn()).pipe(
    mergeMap((loggedIn: boolean) => {
      if (loggedIn) {
        return keycloak.addTokenToHeader(req.headers).pipe(
          mergeMap((headersWithBearer) => {
            const kcReq = req.clone({ headers: headersWithBearer });
            return next(kcReq);
          }),
        );
      } else {
        return next(req);
      }
    }),
  );

}
