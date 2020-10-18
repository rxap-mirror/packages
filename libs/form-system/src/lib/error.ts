import { RxapError } from '@rxap/utilities';

export class RxapFormSystemError extends RxapError {

  constructor(message: string, code: string, className?: string) {
    super('@rxap/form-system', message, code, className);
  }

}
