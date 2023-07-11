import { RxapOpenApiDataSourceError } from '@rxap/open-api/data-source';

export class RxapOpenApiDataSourceTableError extends RxapOpenApiDataSourceError {

  constructor(message: string, code?: string, scope?: string) {
    super(message, code, scope);
    this.addSubPackageName('table');
  }

}
