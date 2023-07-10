import {RxapOpenApiError} from '@rxap/open-api';

export class RxapOpenApiRemoteMethodError extends RxapOpenApiError {

  constructor(message: string, code?: string, scope?: string) {
    super(message, code, scope);
    this.addSubPackageName('remote-method');
  }

}
