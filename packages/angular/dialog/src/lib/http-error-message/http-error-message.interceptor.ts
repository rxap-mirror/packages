import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorMessageService } from './http-error-message.service';

@Injectable()
export class HttpErrorMessageInterceptor implements HttpInterceptor {
  constructor(public httpErrorMessageService: HttpErrorMessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(event => {
        if (event instanceof HttpErrorResponse) {
          if (event.error && event.error.message) {
            this.httpErrorMessageService.showErrorMessage({
              method: req.method,
              body: req.body,
              ...event.error,
            });
          }
        }
        throw event;
      }),
    );
  }
}
