import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  Provider
} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import {
  AppCheckService,
  APP_CHECK_ENABLED
} from './app-check';
import { coerceArray } from '@rxap/utilities';
import { switchMap } from 'rxjs/operators';
import {
  Observable,
  from
} from 'rxjs';

export const FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>('firebase-app-check-http-interceptor-url-pattern');

@Injectable()
export class FirebaseAppCheckHttpInterceptor implements HttpInterceptor {

  private readonly urlPattern: RegExp[] = [];

  constructor(
    public readonly appCheck: AppCheckService,
    @Inject(FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN)
      urlPattern: RegExp | RegExp[],
    @Optional()
    @Inject(APP_CHECK_ENABLED)
    private readonly enabled: boolean | null,
  ) {
    this.urlPattern = coerceArray(urlPattern);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.enabled && this.isMatch(req)) {
      return from(this.appCheck.getToken()).pipe(
        switchMap(token => next.handle(req.clone({
          setHeaders: {
            'X-Firebase-AppCheck': token
          }
        })))
      )
    }
    return next.handle(req);
  }

  private isMatch(req: HttpRequest<any>) {
    return this.urlPattern.some(pattern => req.url.match(pattern));
  }

}

export const FIREBASE_APP_CHECK_HTTP_INTERCEPTOR: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FirebaseAppCheckHttpInterceptor,
  multi: true
}
