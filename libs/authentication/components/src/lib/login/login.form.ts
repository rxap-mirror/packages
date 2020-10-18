import {
  Injectable,
  Provider,
  Injector,
  INJECTOR
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  RxapFormBuilder,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  FormDefinition,
  RxapForm,
  UseFormControl,
  RxapFormControl,
  RxapFormGroup,
  FormSubmitMethod,
  RXAP_FORM_SUBMIT_METHOD
} from '@rxap/forms';
import { Validators } from '@angular/forms';

@RxapForm({
  id: 'rxap-login'
})
@Injectable()
export class LoginForm implements FormDefinition {

  public rxapFormGroup!: RxapFormGroup;

  public loading     = true;
  public loginFailed = false;

  @UseFormControl({
    validators: [ Validators.required, Validators.email ]
  })
  public email!: RxapFormControl<string>;

  @UseFormControl({
    validators: [ Validators.required ]
  })
  public password!: RxapFormControl;

  @UseFormControl({
    state: true
  })
  public remember!: RxapFormControl;

  constructor(
    public readonly authentication: RxapAuthenticationService,
    public readonly snackBar: MatSnackBar
  ) {}

  public async forgotPassword() {
    const successful = await this.authentication.requestPasswordReset(this.rxapFormGroup.value.email!);
    if (successful) {
      this.snackBar.open('FORMS.rxap-login.forgot.SNACK_BAR.SUCCESSFUL', 'ok', { duration: 2500 });
    } else {
      this.snackBar.open('FORMS.rxap-login.forgot.SNACK_BAR.FAILED', 'ok', { panelClass: 'snack-bar-error' });
    }
  }

}

@Injectable()
export class LoginFormSubmitMethod implements FormSubmitMethod<any> {

  constructor(private readonly authentication: RxapAuthenticationService) {}

  public call(value: { email: string, password: string, remember: boolean }): Promise<any> {
    return this.authentication.signInWithEmailAndPassword(value.email, value.password, value.remember);
  }

}

export const LoginFormProviders: Provider[] = [
  LoginForm,
  {
    provide:    RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) => new RxapFormBuilder(LoginForm, injector),
    deps:       [ INJECTOR ]
  },
  {
    provide:    RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps:       [ RXAP_FORM_DEFINITION_BUILDER ]
  },
  {
    provide:  RXAP_FORM_SUBMIT_METHOD,
    useClass: LoginFormSubmitMethod
  }
];
