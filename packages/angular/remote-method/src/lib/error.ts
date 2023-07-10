import {RxapError} from '@rxap/utilities';

export class RxapRemoteMethodError extends RxapError {

  constructor(message: string, code: string, className?: string) {
    super('@rxap/remote-method', message, code, className);
  }

}

