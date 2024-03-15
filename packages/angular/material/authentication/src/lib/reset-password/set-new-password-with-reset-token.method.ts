import { Injectable } from '@angular/core';
import { Method } from '@rxap/pattern';

export interface SetNewPasswordWithResetTokenMethodParameters {
  password: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class SetNewPasswordWithResetTokenMethod implements Method {

  public call(parameters: SetNewPasswordWithResetTokenMethodParameters): Promise<void> {
    throw new Error('Method not implemented.');
  }

}
