import { Injectable } from '@angular/core';
import { Method } from '@rxap/pattern';

export interface RequestResetPasswordMethodParameters {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class RequestResetPasswordMethod implements Method {

  call(parameters: RequestResetPasswordMethodParameters): any {
    throw new Error('Method not implemented.');
  }

}
