import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnyHttpErrorService } from './any-http-error/any-http-error.service';
import { CodeHttpErrorService } from './code-http-error/code-http-error.service';
import {
  DefaultErrorCodeExtractor,
  DefaultErrorFilter,
} from './error-interceptor-options';
import { MessageHttpErrorService } from './message-http-error/message-http-error.service';
import { RXAP_ERROR_INTERCEPTOR_OPTIONS } from './tokens';
import {
  ExtractContextFromError,
  ExtractExtraFromError,
  ExtractTagsFromError,
  SimplifyHttpErrorResponse,
} from './utilities';

export function HttpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  const anyHttpErrorService = inject(AnyHttpErrorService);
  const messageHttpErrorService = inject(MessageHttpErrorService);
  const codeHttpErrorService = inject(CodeHttpErrorService);
  const options = inject(RXAP_ERROR_INTERCEPTOR_OPTIONS, { optional: true }) ?? {};

  options.extractErrorCode ??= DefaultErrorCodeExtractor;
  options.filter ??= [];
  if (!options.filter.length) {
    options.filter.push(DefaultErrorFilter);
  }

  return next(req).pipe(
    tap({
      error: async (event: Error) => {
        if (event instanceof HttpErrorResponse) {

          if (!options.filter?.some((filter) => filter(event))) {
            return;
          }

          let error = event.error;
          if (event.error instanceof Blob) {
            error = await event.error.text();
            try {
              error = JSON.parse(error);
            } catch (e) {
              console.warn('error response object is not a json');
            }
          }

          const data = {
            ...SimplifyHttpErrorResponse(event),
            method: req.method,
            body: req.body,
            timestamp: Date.now(),
          };

          if (error && typeof error === 'object') {
            const errorCode = options.extractErrorCode!(error);
            if (errorCode) {
              Sentry.captureMessage(`Error Code ${ errorCode }`, {
                level: 'warning',
                contexts: ExtractContextFromError(error),
                extra: ExtractExtraFromError(error),
                tags: ExtractTagsFromError(error),
              });
              codeHttpErrorService.push({
                ...data,
                errorCode,
              });
            } else if (event.error.message) {
              messageHttpErrorService.push(data);
            } else {
              anyHttpErrorService.push(data);
            }
          } else {
            anyHttpErrorService.push(data);
          }
        }
      },
    }),
  );

}
