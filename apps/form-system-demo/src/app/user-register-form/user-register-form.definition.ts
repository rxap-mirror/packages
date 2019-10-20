import {
  RxapFormDefinition,
  RxapForm,
  RxapFormTemplate,
  RxapFormControl,
  RxapControlValidator,
  RxapPasswordControl,
  RxapSelectControl,
  RxapControlOptions,
  RxapSelectMultipleControl,
  RxapTextareaControl,
  RxapRadioButtonControl,
  BaseFormControl
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
  <control id="gender"></control>
  <control id="accounts"></control>
  <control id="description"></control>
  <control id="age"></control>
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
    properties: {
      max: 10
    }
  })
  public username!: BaseFormControl<any>;

  @RxapPasswordControl()
  @RxapFormControl({
    properties: {
      max: 10,
    }
  })
  public password!: BaseFormControl<any>;

  @RxapFormControl()
  public email!: BaseFormControl<any>;

  @RxapControlOptions('Male', 'Female')
  @RxapSelectControl()
  @RxapFormControl({
    properties: {
      prefixIcon: { svgIcon: 'gender-female' }
    }
  })
  public gender!: BaseFormControl<any>;

  @RxapControlOptions('Facebook', 'Github', 'Google', 'Amazon', 'Gitlab')
  @RxapSelectMultipleControl()
  @RxapFormControl()
  public accounts!: BaseFormControl<any>;

  @RxapTextareaControl()
  @RxapFormControl()
  public description!: BaseFormControl<any>;

  @RxapControlOptions('10 Jahre', '15 Jahre', '18 Jahre')
  @RxapRadioButtonControl()
  @RxapFormControl()
  public age!: BaseFormControl<any>;

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
