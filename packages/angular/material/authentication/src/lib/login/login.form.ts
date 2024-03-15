import {
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Provider,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '@rxap/config';
import {
  FormSubmitMethod,
  FormSubmitSuccessfulMethod,
  FormType,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { RxapOnInit } from '@rxap/utilities';
import { SignInWithEmailAndPasswordMethod } from './sign-in-with-email-and-password.method';

export interface ILoginForm {
  email: string;
  password: string;
}

@RxapForm({
  id: 'rxap-login',
}) @Injectable()
export class LoginForm implements FormType<ILoginForm>, RxapOnInit {
  public rxapFormGroup!: RxapFormGroup;

  public loading = true;
  public loginFailed = false;

  @UseFormControl({
    validators: [ Validators.required, Validators.email ],
  })
  public email!: RxapFormControl<string>;

  @UseFormControl({
    validators: [ Validators.required ],
  })
  public password!: RxapFormControl;

  @UseFormControl({
    state: true,
  })
  public remember!: RxapFormControl;

  constructor(public readonly config: ConfigService<any>) {
  }

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
  constructor(private readonly signInWithEmailAndPasswordMethod: SignInWithEmailAndPasswordMethod) {
  }

  public call(value: {
    email: string;
    password: string;
    remember: boolean;
  }): Promise<any> {
    return this.signInWithEmailAndPasswordMethod.call({
      email: value.email,
      password: value.password,
      remember: value.remember,
    });
  }
}

@Injectable()
export class LoginFormSubmitSuccessful
  implements FormSubmitSuccessfulMethod<any> {
  constructor(
    @Inject(Router)
    private readonly router: Router,
  ) {
  }

  public call(): Promise<any> {
    console.debug('Login was successful. Navigate to application root');
    return this.router.navigate([ '/' ]);
  }
}

export const LoginFormProviders: Provider[] = [
  LoginForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) =>
      new RxapFormBuilder<ILoginForm>(LoginForm, injector),
    deps: [ INJECTOR ],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps: [ RXAP_FORM_DEFINITION_BUILDER ],
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
