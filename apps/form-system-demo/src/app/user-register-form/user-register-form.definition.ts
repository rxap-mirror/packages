import {
  RxapFormDefinition,
  RxapForm,
  RxapFormControl,
  RxapControlValidator,
  RxapPasswordControl,
  RxapControlOptions,
  RxapTextareaControl,
  RxapRadioButtonControl,
  BaseFormControl,
  RxapSelectMultipleListControl,
  SelectFormControl,
  RxapSelectMultipleOrCreateControl,
  RxapSelectListControl,
  RxapControlRequired
} from '@rxap/form-system';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CHILDREN_FORM } from './children-form.definition';

export const USER_REGISTER_FORM = 'user-register';

export interface UserRegisterForm {
  username: string;
  password: string;
  email: string;
}

@RxapForm(USER_REGISTER_FORM)
@Injectable()
export class UserRegisterFormDefinition
  extends RxapFormDefinition<UserRegisterForm> {

  @RxapControlRequired()
  @RxapControlValidator<string>({
    validator: username => username && username.match(/[A-Z]/) ? null : false,
    message:   'Should start with uppercase latter'
  })
  @RxapFormControl({
    properties: {
      max: 10
    }
  })
  public username!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapPasswordControl()
  @RxapFormControl({
    properties: {
      max: 10,
    }
  })
  public password!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapFormControl()
  public email!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapControlOptions('Male', 'Female')
  @RxapSelectListControl()
  @RxapFormControl()
  public gender!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapControlOptions('Facebook', 'Github', 'Google', 'Amazon', 'Gitlab')
  @RxapSelectMultipleListControl()
  @RxapFormControl()
  public accounts!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapTextareaControl()
  @RxapFormControl()
  public description!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapControlOptions('10 Jahre', '15 Jahre', '18 Jahre')
  @RxapRadioButtonControl()
  @RxapFormControl()
  public age!: BaseFormControl<any>;

  @RxapControlRequired()
  @RxapSelectMultipleOrCreateControl(CHILDREN_FORM)
  @RxapFormControl()
  public children!: SelectFormControl<any>;

  constructor(public route: ActivatedRoute) {
    super();
  }

  rxapOnLoad(): Promise<any> {
    return this.route.params.toPromise();
  }

  rxapOnSubmit() {
    console.log('submit');
  }

  async rxapOnSubmitValid() {
    console.log('submit valid');
  }

  rxapOnSubmitInvalid() {
    console.log(this.group.getErrorTree());
    console.log('submit invalid');
  }

  rxapOnSubmitError() {
    console.log('submit error');
  }

}
