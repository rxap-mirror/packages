import {
  Inject,
  Injectable,
  Optional,
  Provider,
} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { coerceArray } from '@rxap/utilities';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import {
  from,
  Observable,
} from 'rxjs';
import {
  AppCheck,
  getToken,
} from '@angular/fire/app-check';
import {
  APP_CHECK_ENABLED,
  FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN,
} from './tokens';

@Injectable()
export class FirebaseAppCheckHttpInterceptor implements HttpInterceptor {

  private readonly urlPattern: RegExp[] = [];

  constructor(
    public readonly appCheck: AppCheck,
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
      return from(getToken(this.appCheck)).pipe(
        map(response => response.token),
        switchMap(token => next.handle(req.clone({
          setHeaders: {
            'X-Firebase-AppCheck': token,
          },
        }))),
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
  multi: true,
}
