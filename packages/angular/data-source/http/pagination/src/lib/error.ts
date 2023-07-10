import { RxapHttpDataSourceError } from '@rxap/data-source/http';

export class RxapHttpPaginationDataSourceError extends RxapHttpDataSourceError {

  constructor(message: string, code: string, className?: string) {
    super(message, code, className);
    this.addSubPackageName('pagination');
  }

}
