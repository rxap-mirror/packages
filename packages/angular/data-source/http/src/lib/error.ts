import {RxapDataSourceError} from '@rxap/data-source';

export class RxapHttpDataSourceError extends RxapDataSourceError {

  constructor(message: string, code: string, className?: string) {
    super(message, code, className);
    this.addSubPackageName('http');
  }

}
