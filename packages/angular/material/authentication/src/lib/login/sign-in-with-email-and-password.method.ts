import { Injectable } from '@angular/core';
import { Method } from '@rxap/pattern';

export interface SignInWithEmailAndPasswordMethodParameters {
  email: string;
  password: string;
  remember?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SignInWithEmailAndPasswordMethod implements Method {

  call(parameters: SignInWithEmailAndPasswordMethodParameters): Promise<void> {
    throw new Error('Method not implemented.');
  }

}
