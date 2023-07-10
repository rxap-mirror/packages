import { HttpErrorResponse } from '@angular/common/http';
import { OpenApiMetaData } from './open-api.meta-data';

export class OpenApiHttpResponseError extends Error {

  constructor(
    public readonly httpErrorResponse: HttpErrorResponse,
    public readonly metadata: OpenApiMetaData,
  ) {
    super(httpErrorResponse.message);
    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, OpenApiHttpResponseError);
    }
    this.name = 'OpenApiHttpResponseError';
  }

  get status() {
    return this.httpErrorResponse.status;
  }

  get operationId() {
    return this.metadata.id;
  }

}
