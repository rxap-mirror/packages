import type { MockInstance } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RxapAuthenticationService } from '@rxap/authentication';
import { ConfigService, RXAP_CONFIG } from '@rxap/config';
import { RXAP_FORM_DEFINITION, RXAP_FORM_SUBMIT_METHOD } from '@rxap/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthenticationContainerComponent } from './authentication-container/authentication-container.component';
import { LoadingComponent } from './loading/loading.component';
import { LoginComponent } from './login/login.component';
import {
  LoginFormSubmitMethod,
  LoginFormSubmitSuccessful,
  LoginFormProviders,
} from './login/login.form';
import { RequestResetPasswordMethod } from './login/request-reset-password.method';
import { SignInWithEmailAndPasswordMethod } from './login/sign-in-with-email-and-password.method';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {
  ResetPasswordFormProviders,
  ResetPasswordFormSubmitMethod,
} from './reset-password/reset-password.form';
import { SetNewPasswordWithResetTokenMethod } from './reset-password/set-new-password-with-reset-token.method';
import { AUTHENTICATION_ROUTE } from './routes';

describe('default methods', () => {
  it('throw not implemented', () => {
    expect(() => new RequestResetPasswordMethod().call({ email: 'a' })).toThrow('Method not implemented.');
    expect(() => new SignInWithEmailAndPasswordMethod().call({ email: 'a', password: 'b' })).toThrow();
    expect(() => new SetNewPasswordWithResetTokenMethod().call({ password: 'a', token: 'b' })).toThrow();
  });
});

describe('default methods as root providers', () => {
  it.each([
    ['RequestResetPasswordMethod', RequestResetPasswordMethod, { email: 'a' }],
    ['SignInWithEmailAndPasswordMethod', SignInWithEmailAndPasswordMethod, { email: 'a', password: 'b' }],
    ['SetNewPasswordWithResetTokenMethod', SetNewPasswordWithResetTokenMethod, { password: 'a', token: 'b' }],
  ] as const)('%s is provided in root and can be replaced by the application', (_name, token, parameters) => {
    const method = TestBed.inject(token as any) as { call: (p: unknown) => unknown };
    expect(method).toBeInstanceOf(token);
    expect(() => method.call(parameters)).toThrow('Method not implemented.');
    // the application overrides the default with its own implementation
    TestBed.resetTestingModule();
    const custom = { call: vi.fn(() => 'custom') };
    TestBed.configureTestingModule({ providers: [{ provide: token, useValue: custom }] });
    expect((TestBed.inject(token as any) as typeof custom).call()).toBe('custom');
  });
});

describe('AUTHENTICATION_ROUTE', () => {
  it('declares the child routes', () => {
    const children = AUTHENTICATION_ROUTE[0].children!;
    expect(children.map((c) => c.path)).toEqual(['login', 'reset-password/:token', 'loading', '**']);
    expect(AUTHENTICATION_ROUTE[1].redirectTo).toBe('');
  });
});

describe('LoginComponent', () => {
  const requestReset = { call: vi.fn() };
  const signIn = { call: vi.fn() };
  const snackBar = { open: vi.fn() };
  let config: any;

  @Component({
    template: `<rxap-authentication-container></rxap-authentication-container><rxap-login></rxap-login>`,
    imports: [AuthenticationContainerComponent, LoginComponent],
  })
  class HostComponent {}

  beforeEach(() => {
    config = {};
    requestReset.call.mockReset();
    signIn.call.mockReset();
    snackBar.open.mockReset();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: RXAP_CONFIG, useFactory: () => config },
        { provide: RxapAuthenticationService, useValue: {} },
        { provide: RequestResetPasswordMethod, useValue: requestReset },
        { provide: SignInWithEmailAndPasswordMethod, useValue: signIn },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
  });

  function create() {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const loginDebug = f.debugElement.children[1];
    vi.spyOn(loginDebug.injector.get(MatSnackBar), 'open').mockImplementation(snackBar.open as any);
    return { f, el: f.nativeElement as HTMLElement, login: loginDebug.componentInstance as LoginComponent };
  }

  it('renders the form', () => {
    const { el } = create();
    expect(el.querySelector('input[formcontrolname="email"]')).not.toBeNull();
    expect(el.querySelector('input[formcontrolname="password"]')).not.toBeNull();
  });

  it('uses default credentials from config', () => {
    config = { authentication: { default: { email: 'd@x.de', password: 'pw' } } };
    const { el, f } = create();
    f.detectChanges();
    expect((el.querySelector('input[formcontrolname="email"]') as HTMLInputElement).value).toBe('d@x.de');
    expect((el.querySelector('input[formcontrolname="password"]') as HTMLInputElement).value).toBe('pw');
  });

  it('toggles the password visibility', () => {
    const { el, f } = create();
    const input = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    expect(input.type).toBe('password');
    (el.querySelector('.password-input button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(input.type).toBe('text');
    (el.querySelector('.password-input button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(input.type).toBe('password');
  });

  it('shows a success snack bar for a truthy reset request', async () => {
    const { login } = create();
    requestReset.call.mockResolvedValue(true);
    await login.requestPasswordReset('a@b.de');
    expect(requestReset.call).toHaveBeenCalledWith({ email: 'a@b.de' });
    expect(snackBar.open).toHaveBeenCalledWith('The password reset request was successful', undefined, { duration: 3000 });
  });

  it('shows an error snack bar for a falsy result', async () => {
    const { login } = create();
    requestReset.call.mockResolvedValue(false);
    await login.requestPasswordReset('a@b.de');
    expect(snackBar.open).toHaveBeenCalledWith(
      'The password reset request result is falsy',
      undefined,
      { duration: 5000, panelClass: 'error' },
    );
  });

  it('shows the error message when the request fails', async () => {
    const { login } = create();
    requestReset.call.mockRejectedValue(new Error('boom'));
    await login.requestPasswordReset('a@b.de');
    expect(snackBar.open).toHaveBeenCalledWith('boom', undefined, { duration: 3000, panelClass: 'error' });
    expect(login.requestingPasswordReset$.value).toBe(false);
  });

  it('submits the credentials via the sign in method', async () => {
    signIn.call.mockResolvedValue(undefined);
    create();
    const method = TestBed.runInInjectionContext(() => new LoginFormSubmitMethod());
    await method.call({ email: 'a', password: 'b', remember: true });
    expect(signIn.call).toHaveBeenCalledWith({ email: 'a', password: 'b', remember: true });
  });

  it('navigates to root after a successful login', async () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const m = TestBed.runInInjectionContext(() => new LoginFormSubmitSuccessful());
    await m.call();
    expect(nav).toHaveBeenCalledWith(['/']);
  });

  it('exposes login form providers', () => {
    expect(LoginFormProviders.length).toBe(5);
  });
});

describe('ResetPasswordComponent', () => {
  const setNew = { call: vi.fn() };
  const snackBar = { open: vi.fn() };
  const params = new BehaviorSubject({ token: 'tok' });

  beforeEach(() => {
    setNew.call.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: RXAP_CONFIG, useValue: {} },
        { provide: ActivatedRoute, useValue: { params } },
        { provide: SetNewPasswordWithResetTokenMethod, useValue: setNew },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
  });

  it('renders', () => {
    const f = TestBed.createComponent(ResetPasswordComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('validates that passwords are equal and resets the repeat', () => {
    const f = TestBed.createComponent(ResetPasswordComponent);
    f.detectChanges();
    const def: any = f.debugElement.injector.get(RXAP_FORM_DEFINITION);
    const form = def.rxapFormGroup ?? def;
    form.get('password').setValue('abc');
    form.get('passwordRepeat').setValue('abd');
    expect(form.get('passwordRepeat').errors).toEqual({ equal: 'passwords are not equal' });
    form.get('passwordRepeat').setValue('abc');
    expect(form.get('passwordRepeat').errors).toBeNull();
    form.get('password').setValue('new');
    expect(form.get('passwordRepeat').value).toBeNull();
  });

  it('submits with the route token and navigates', async () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    setNew.call.mockReturnValue(of(undefined));
    const m = TestBed.runInInjectionContext(() => new ResetPasswordFormSubmitMethod());
    await expect(m.call({ password: 'x' })).resolves.toBe(true);
    expect(setNew.call).toHaveBeenCalledWith({ password: 'x', token: 'tok' });
    expect(snackBar.open).toHaveBeenCalledWith('Password reset was successful.', undefined, { duration: 3500 });
    expect(nav).toHaveBeenCalledWith(['/']);
  });

  it('shows a failure snack bar when setting the password fails', async () => {
    setNew.call.mockReturnValue(throwError(() => new Error('x')));
    const m = TestBed.runInInjectionContext(() => new ResetPasswordFormSubmitMethod());
    await expect(m.call({ password: 'x' })).rejects.toThrow('x');
    expect(snackBar.open).toHaveBeenCalledWith('Password reset failed.', undefined, { duration: 3500 });
  });

  it('exposes providers', () => {
    expect(ResetPasswordFormProviders.some((p: any) => p.provide === RXAP_FORM_SUBMIT_METHOD)).toBe(true);
  });
});

describe('LoadingComponent', () => {
  const isAuthenticated$ = new BehaviorSubject<boolean | null>(null);
  let navigate: MockInstance;

  function setup(auth: any) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: RxapAuthenticationService, useValue: auth },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const f = TestBed.createComponent(LoadingComponent);
    f.detectChanges();
    return f;
  }

  it('navigates to login once the authentication state is known', () => {
    const f = setup({ isAuthenticated$ });
    expect(navigate).not.toHaveBeenCalled();
    isAuthenticated$.next(false);
    expect(navigate).toHaveBeenCalledWith(['/', 'authentication', 'login']);
    f.destroy();
    expect(f.componentInstance.subscription?.closed).toBe(true);
  });

  it('does nothing without an isAuthenticated$ stream', () => {
    const f = setup({});
    expect(f.componentInstance.subscription).toBeUndefined();
    f.destroy();
  });
});

describe('AuthenticationContainerComponent', () => {
  it('renders a router outlet', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(AuthenticationContainerComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
