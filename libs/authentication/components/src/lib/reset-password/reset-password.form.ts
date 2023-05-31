import {
  Injectable,
  Provider,
  Injector,
  INJECTOR,
  Inject
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  map,
  switchMap,
  tap,
  take
} from 'rxjs/operators';
import {
  UseFormControl,
  RxapFormBuilder,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  RXAP_FORM_SUBMIT_METHOD,
  FormSubmitMethod,
  ControlSetValue,
  ControlValidator,
  FormType
} from '@rxap/forms';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private readonly router: Router
  ) {}

  public call(value: { password: string }): boolean | Promise<boolean> {
    return this.route.params
      .pipe(
        take(1),
        map((params) => params.token),
        switchMap((token) =>
          this.authentication.sendPasswordReset(value.password, token)
        ),
        tap((result) => {
          if (result) {
            this.snackBar.open('Password reset was successful.', undefined, {
              duration: 3500,
            });
            return this.router.navigate(['/']);
          }
          return Promise.resolve();
        })
      )
      .toPromise();
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
  public passwordEqual() {
    if (this.password.value !== this.passwordRepeat.value) {
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
