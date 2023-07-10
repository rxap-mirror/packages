import {RxapError} from '@rxap/utilities';

export class RxapDefinitionError extends RxapError {

  constructor(message: string, code: string, className?: string) {
    super('@rxap/definition', message, code, className);
  }

}
