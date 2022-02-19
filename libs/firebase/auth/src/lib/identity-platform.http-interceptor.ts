import {
  HttpInterceptor,
  HTTP_INTERCEPTORS,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import {
  Injectable,
  Provider,
  Inject,
  InjectionToken
} from '@angular/core';
import { Observable } from 'rxjs';
import { coerceArray } from '@rxap/utilities';
import {
  switchMap,
  tap
} from 'rxjs/operators';
import { isDefined } from '@rxap/utilities/rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export const IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>('identity-platform-http-interceptor-url-pattern');


@Injectable()
export class IdentityPlatformHttpInterceptor implements HttpInterceptor {

  private readonly urlPattern: RegExp[] = [];

  constructor(
    @Inject(AngularFireAuth)
    public fireAuth: AngularFireAuth,
    @Inject(IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN)
    urlPattern: RegExp | RegExp[]
  ) {
    this.urlPattern = coerceArray(urlPattern);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isMatch(req)) {
      return this.fireAuth.idToken.pipe(
        tap(idToken => {
          if (!idToken) {
            throw new Error(`The isToken is not defined. Ensure that the user is logged in, before sending a request to '${req.url}'`);
          }
        }),
        isDefined(),
        switchMap(idToken => next.handle(req.clone({
          setHeaders: {
            idToken: idToken
          }
        })))
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
  multi: true
}
