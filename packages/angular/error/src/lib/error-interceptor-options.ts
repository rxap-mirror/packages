import { HttpErrorResponse } from '@angular/common/http';

export function DefaultErrorCodeExtractor(error: HttpErrorResponse): number | string | null {
  return error.error?.code ?? null;
}

export function DefaultErrorFilter(error: HttpErrorResponse): boolean {
  return error.status >= 400 && (!error.url || !/\/api\/status/.test(error.url));
}

export interface ErrorInterceptorOptions {
  extractErrorCode?: (error: HttpErrorResponse) => number | string | null;
  filter?: Array<(error: HttpErrorResponse) => boolean>;
}
