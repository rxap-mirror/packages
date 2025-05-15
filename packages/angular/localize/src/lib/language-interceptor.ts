import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import {
  inject,
  LOCALE_ID,
} from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Intercepts an HTTP request to include a localized 'Accept-Language' header, if available.
 *
 * @param {HttpRequest<unknown>} request - The HTTP request to be intercepted and optionally modified.
 * @param {HttpHandlerFn} next - The next handler in the HTTP request pipeline.
 * @return {Observable<HttpEvent<unknown>>} An observable of the HTTP response event.
 */
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
