import { HttpErrorResponse } from '@angular/common/http';
import { OpenApiMetaData } from './open-api.meta-data';

export class OpenApiHttpResponseError extends HttpErrorResponse {

  constructor(
    public readonly httpErrorResponse: HttpErrorResponse,
    public readonly metadata: OpenApiMetaData,
  ) {
    super({
      error: httpErrorResponse.error,
      headers: httpErrorResponse.headers,
      status: httpErrorResponse.status,
      statusText: httpErrorResponse.statusText,
      url: httpErrorResponse.url ?? undefined,
    });
    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, OpenApiHttpResponseError);
    }
    Reflect.set(this, 'name', 'OpenApiHttpResponseError');
  }

  get operationId() {
    return this.metadata.id;
  }

}
