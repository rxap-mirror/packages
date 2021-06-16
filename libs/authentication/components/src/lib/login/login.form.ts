import {
  Injectable,
  Provider,
  Injector,
  INJECTOR,
  Inject,
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
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
  RXAP_FORM_SUBMIT_METHOD,
  FormSubmitSuccessfulMethod,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  FormType,
} from '@rxap/forms';
import { Validators } from '@angular/forms';
import { ConfigService } from '@rxap/config';
import { RxapOnInit } from '@rxap/utilities';
import { Router } from '@angular/router';

export interface ILoginForm {
  email: string;
  password: string;
}

@RxapForm({
  id: 'rxap-login',
  providers: [
    {
      provide: ConfigService,
      useExisting: ConfigService,
    },
  ],
})
@Injectable()
export class LoginForm implements FormType<ILoginForm>, RxapOnInit {
  public rxapFormGroup!: RxapFormGroup;

  public loading = true;
  public loginFailed = false;

  @UseFormControl({
    validators: [Validators.required, Validators.email],
  })
  public email!: RxapFormControl<string>;

  @UseFormControl({
    validators: [Validators.required],
  })
  public password!: RxapFormControl;

  @UseFormControl({
    state: true,
  })
  public remember!: RxapFormControl;

  constructor(public readonly config: ConfigService<any>) {}

  public rxapOnInit() {
    const email = this.config.get<string>('authentication.default.email');
    if (email) {
      this.email.setValue(email);
    }
    const password = this.config.get<string>('authentication.default.password');
    if (password) {
      this.password.setValue(password);
    }
  }
}

@Injectable()
export class LoginFormSubmitMethod implements FormSubmitMethod<any> {
  constructor(private readonly authentication: RxapAuthenticationService) {}

  public call(value: {
    email: string;
    password: string;
    remember: boolean;
  }): Promise<any> {
    return this.authentication.signInWithEmailAndPassword(
      value.email,
      value.password,
      value.remember
    );
  }
}

@Injectable()
export class LoginFormSubmitSuccessful
  implements FormSubmitSuccessfulMethod<any>
{
  constructor(
    @Inject(Router)
    private readonly router: Router
  ) {}

  public call(): Promise<any> {
    return this.router.navigate(['/']);
  }
}

export const LoginFormProviders: Provider[] = [
  LoginForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) =>
      new RxapFormBuilder<ILoginForm>(LoginForm, injector),
    deps: [INJECTOR],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps: [RXAP_FORM_DEFINITION_BUILDER],
  },
  {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useClass: LoginFormSubmitMethod,
  },
  {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useClass: LoginFormSubmitSuccessful,
  },
];
