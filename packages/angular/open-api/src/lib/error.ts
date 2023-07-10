import {RxapError} from '@rxap/utilities';

export class RxapOpenApiError extends RxapError {

  constructor(message: string, code?: string, scope?: string) {
    super('@rxap/open-api', message, code ?? '', scope);
  }

}
