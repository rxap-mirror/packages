import {
  RxapFormDefinition,
  RxapForm,
  RxapFormTemplate,
  RxapFormControl,
  RxapControlValidator
} from '@rxap/form-system';
import { Injectable } from '@angular/core';

export const USER_REGISTER_FORM = 'user-register';

export interface UserRegisterForm {
  username: string;
  password: string;
  email: string;
}

@RxapFormTemplate(`<column>
  <control id="username"/>
  <control id="password"/>
  <control id="email"/>
</column>`)
@RxapForm(USER_REGISTER_FORM)
@Injectable()
export class UserRegisterFormDefinition
  extends RxapFormDefinition<UserRegisterForm> {

  @RxapControlValidator<string>({
    validator: username => username.match(/[A-Z]/) ? null : false,
    message: 'Should start with uppercase latter'
  })
  @RxapFormControl({
    options: {
      max: 10
    }
  })
  public username;

  @RxapFormControl({
    options: {
      type: 'password',
      max: 10,
      appearance: 'legacy'
    }
  })
  public password;

  @RxapFormControl({
    options: {
      type: 'email',
    }
  })
  public email;

  rxapOnSubmit() {
    console.log('submit');
  }

  rxapOnSubmitValid() {
    console.log('submit valid');
  }

  rxapOnSubmitInvalid() {
    console.log('submit invalid');
  }

  rxapOnSubmitError() {
    console.log('submit error');
  }

}
