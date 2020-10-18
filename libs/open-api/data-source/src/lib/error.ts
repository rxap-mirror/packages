import { RxapOpenApiError } from '@rxap/open-api';

export class RxapOpenApiDataSourceError extends RxapOpenApiError {

  constructor(message: string, code?: string, scope?: string) {
    super(message, code, scope);
    this.addSubPackageName('data-source');
  }

}
