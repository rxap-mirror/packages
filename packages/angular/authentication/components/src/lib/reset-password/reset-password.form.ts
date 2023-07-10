import {
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Provider,
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import {
  ControlSetValue,
  ControlValidator,
  FormSubmitMethod,
  FormType,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_SUBMIT_METHOD,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

export const RXAP_RESET_PASSWORD_FORM = 'rxap-reset-password';

@Injectable()
export class ResetPasswordFormSubmitMethod implements FormSubmitMethod<any> {
  constructor(
    @Inject(ActivatedRoute)
    private readonly route: ActivatedRoute,
    @Inject(RxapAuthenticationService)
    private readonly authentication: RxapAuthenticationService,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
    @Inject(Router)
    private readonly router: Router,
  ) {
  }

  public call(value: { password: string }): boolean | Promise<boolean> {
    return firstValueFrom(this.route.params
      .pipe(
        take(1),
        map((params) => params['token']),
        switchMap((token) =>
          this.authentication.sendPasswordReset(value.password, token),
        ),
        tap((result) => {
          if (result) {
            this.snackBar.open('Password reset was successful.', undefined, {
              duration: 3500,
            });
            return this.router.navigate(['/']);
          }
          return Promise.resolve();
        }),
        map(() => true),
      ));
  }
}

export interface IResetPasswordForm {
  password: string;
  passwordRepeat: string;
}

@RxapForm({
  id: RXAP_RESET_PASSWORD_FORM,
})
@Injectable()
export class ResetPasswordForm implements FormType<IResetPasswordForm> {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({
    validators: [Validators.required],
  })
  public password!: RxapFormControl;

  @UseFormControl({
    validators: [Validators.required],
  })
  public passwordRepeat!: RxapFormControl;

  @ControlValidator('passwordRepeat')
  public passwordEqual(control: RxapFormControl) {
    if (this.password.value === null || control.value === null) {
      return null;
    }
    if (this.password.value !== control.value) {
      return { equal: 'passwords are not equal' };
    }
    return null;
  }

  @ControlSetValue('password')
  public resetRepeat() {
    this.passwordRepeat.reset();
  }
}

export const ResetPasswordFormProviders: Provider[] = [
  ResetPasswordForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) =>
      new RxapFormBuilder<IResetPasswordForm>(ResetPasswordForm, injector),
    deps: [INJECTOR],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder<IResetPasswordForm>) =>
      builder.build(),
    deps: [RXAP_FORM_DEFINITION_BUILDER],
  },
  {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useClass: ResetPasswordFormSubmitMethod,
  },
];
