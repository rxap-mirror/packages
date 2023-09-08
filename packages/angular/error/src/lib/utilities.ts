import { HttpErrorResponse } from '@angular/common/http';

export interface SimplifiedHttpErrorResponse extends Record<string, unknown> {
  url: string | null;
  message: string;
  name: string;
  status: number;
  statusText: string;
  headers: Record<string, string[]>;
  error: any;
  errorMessage: string;
}

export function SimplifyHttpErrorResponse(event: HttpErrorResponse): SimplifiedHttpErrorResponse {
  let error = event.error;
  if (typeof error !== 'object') {
    if (error instanceof Blob) {
      console.warn('error response object is a blob');
      error = '[BLOB]';
    } else {
      try {
        error = JSON.parse(error);
      } catch (e) {
        console.warn('error response object is not a json');
      }
    }
  }
  return {
    errorMessage: (typeof error === 'object' ? error?.message : undefined) ?? event.message,
    error: error,
    message: event.message,
    name: event.name,
    status: event.status,
    statusText: event.statusText,
    url: event.url,
    headers: event.headers.keys()
                  .reduce((map, key) => ({
                    ...map,
                    [key]: event.headers.getAll(key),
                  }), {}),
  };
}

export function ExtractContextFromError(error: unknown) {
  const context: Record<string, Record<string, unknown>> = {};

  if (error instanceof HttpErrorResponse) {
    context['response'] = SimplifyHttpErrorResponse(error);
  }

  return context;
}

export function ExtractExtraFromError(error: unknown) {
  return {};
}

export function ExtractTagsFromError(error: unknown) {
  return {};
}

export function ExtractError(error: unknown) {
  if (error instanceof HttpErrorResponse) {
    return error;
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Handled unknown error';
}

export function PrintError(errorCandidate: unknown) {
  if (errorCandidate instanceof HttpErrorResponse) {
    console.groupCollapsed(errorCandidate.message);
    const {
      headers,
      error,
      ...map
    } = SimplifyHttpErrorResponse(errorCandidate);
    if (typeof error === 'object' && error?.message) {
      console.log(error?.message);
    }
    console.log(error);
    console.table(map);
    console.groupCollapsed('Headers');
    console.table(headers);
    console.groupEnd();
    console.groupEnd();
  } else if (errorCandidate instanceof Error) {
    console.error(errorCandidate);
  } else if (typeof errorCandidate === 'string') {
    console.error(errorCandidate);
  }
}
