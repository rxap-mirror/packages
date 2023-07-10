import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  Inject,
  Injectable,
  InjectionToken,
  Provider,
} from '@angular/core';
import {
  Observable,
  throwError,
} from 'rxjs';
import { coerceArray } from '@rxap/utilities';
import {
  catchError,
  switchMap,
  tap,
} from 'rxjs/operators';
import { isDefined } from '@rxap/rxjs';
import {
  Auth,
  idToken,
} from '@angular/fire/auth';

export const IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>(
  'identity-platform-http-interceptor-url-pattern');


@Injectable()
export class IdentityPlatformHttpInterceptor implements HttpInterceptor {

  private readonly urlPattern: RegExp[] = [];

  constructor(
    public readonly auth: Auth,
    @Inject(IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN)
      urlPattern: RegExp | RegExp[],
  ) {
    this.urlPattern = coerceArray(urlPattern);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isMatch(req)) {
      return idToken(this.auth).pipe(
        tap(idTokenValue => {
          if (!idTokenValue) {
            throw new Error(`The isToken is not defined. Ensure that the user is logged in, before sending a request to '${req.url}'`);
          }
        }),
        isDefined(),
        switchMap(idTokenValue => next.handle(req.clone({
          setHeaders: {
            idToken: idTokenValue,
          },
        })).pipe(
          catchError(error => {
            if (error instanceof HttpErrorResponse) {
              if (error.status === 401) {
                this.auth.signOut().then(() => location.reload());
              }
            }
            return throwError(error);
          }),
        )),
      );
    }
    return next.handle(req);
  }

  private isMatch(req: HttpRequest<any>) {
    return this.urlPattern.some(pattern => req.url.match(pattern));
  }

}

export const IDENTITY_PLATFORM_HTTP_INTERCEPTOR: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: IdentityPlatformHttpInterceptor,
  multi: true,
}
