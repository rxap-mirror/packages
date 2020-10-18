import { RxapError } from '@rxap/utilities';

export class RxapDataSourceError extends RxapError {

  constructor(message: string, code: string, className?: string) {
    super('@rxap/data-source', message, code, className);
  }

}
