import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import {
  inject,
  LOCALE_ID,
} from '@angular/core';
import { Observable } from 'rxjs';

export function LanguageInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {

  const localId = inject(LOCALE_ID, { optional: true });

  if (localId) {
    request = request.clone({
      headers: request.headers.set('Accept-Language', localId),
    });
  }

  return next(request);

}
