import {RxapRemoteMethodError} from '@rxap/remote-method';

export class RxapRemoteMethodDirectiveError extends RxapRemoteMethodError {

  constructor(message: string, code?: string, scope?: string) {
    super(message, code ?? '', scope);
  }

}
