import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  Component,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  firstValueFrom,
  of,
} from 'rxjs';
import {
  AuthenticationEventType,
  RxapAuthenticationService,
} from './authentication.service';
import { AuthenticationRoutingService } from './authentication-routing.service';
import { BearerTokenInterceptor } from './bearer-token.interceptor';
import { DisabledAuthenticationService } from './disabled-authentication.service';
import {
  provideAuthentication,
  withInitialAuthenticationState,
} from './provide';
import { RegisterService } from './register.service';
import { SignOutDirective } from './sign-out.directive';
import {
  AuthenticationAccessToken,
  RXAP_AUTHENTICATION_ACCESS_TOKEN,
  RXAP_AUTHENTICATION_DEACTIVATED,
  RXAP_INITIAL_AUTHENTICATION_STATE,
  withDisabledAuthentication,
} from './tokens';

describe('authentication', () => {
  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  describe('RxapAuthenticationService', () => {
    it('initialises from the initial state token and signs out', async () => {
      TestBed.configureTestingModule({ providers: [ withInitialAuthenticationState(true) ] });
      const service = TestBed.inject(RxapAuthenticationService);
      await Promise.resolve();
      expect(service.isAuthenticated$.value).toBe(true);
      expect(await service.isAuthenticated()).toBe(true);
      const events: any[] = [];
      service.events$.subscribe(e => events.push(e));
      await service.signOut();
      expect(service.isAuthenticated$.value).toBe(false);
      expect(events).toEqual([ { type: AuthenticationEventType.OnLogout } ]);
    });

    it('defaults to unauthenticated', () => {
      expect(TestBed.inject(RXAP_INITIAL_AUTHENTICATION_STATE)).toBe(false);
    });
  });

  it('provideAuthentication maps the service class', () => {
    TestBed.configureTestingModule({ providers: [ provideAuthentication(DisabledAuthenticationService) ] });
    expect(TestBed.inject(RxapAuthenticationService)).toBeInstanceOf(DisabledAuthenticationService);
  });

  it('withDisabledAuthentication provides the flag', () => {
    TestBed.configureTestingModule({ providers: [ withDisabledAuthentication() ] });
    expect(TestBed.inject(RXAP_AUTHENTICATION_DEACTIVATED)).toBe(true);
  });

  it('DisabledAuthenticationService is always authenticated', async () => {
    const s = new DisabledAuthenticationService();
    expect(await s.isAuthenticated()).toBe(true);
    expect(await firstValueFrom(s.isAuthenticated$)).toBe(true);
    await s.signOut();
  });

  it('RegisterService warns and resolves true', async () => {
    const s = TestBed.inject(RegisterService);
    expect(await s.register('a', 'b')).toBe(true);
    expect(console.warn).toHaveBeenCalled();
  });

  describe('AuthenticationRoutingService', () => {
    function setup(deactivated: boolean, auth$: BehaviorSubject<boolean | null>) {
      const router = { navigate: jest.fn() };
      TestBed.configureTestingModule({
        providers: [
          { provide: Router, useValue: router },
          { provide: RxapAuthenticationService, useValue: { isAuthenticated$: auth$ } },
          { provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: deactivated },
        ],
      });
      TestBed.inject(AuthenticationRoutingService);
      return router;
    }

    it('navigates according to the auth state', () => {
      const auth$ = new BehaviorSubject<boolean | null>(true);
      const router = setup(false, auth$);
      expect(router.navigate).toHaveBeenLastCalledWith([ '/' ]);
      auth$.next(false);
      expect(router.navigate).toHaveBeenLastCalledWith([ '/', 'authentication', 'login' ]);
    });

    it('does nothing when deactivated', () => {
      const router = setup(true, new BehaviorSubject<boolean | null>(true));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('BearerTokenInterceptor', () => {
    function run(url: string, token: AuthenticationAccessToken | null) {
      TestBed.configureTestingModule({
        providers: [ { provide: RXAP_AUTHENTICATION_ACCESS_TOKEN, useValue: new BehaviorSubject(token) } ],
      });
      const next = jest.fn((r: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 }))) as unknown as jest.Mock & HttpHandlerFn;
      runInInjectionContext(TestBed.inject(Injector), () => BearerTokenInterceptor(new HttpRequest('GET', url), next)).subscribe();
      return next.mock.calls[ 0 ][ 0 ] as HttpRequest<unknown>;
    }

    it('adds the header for api urls', () => {
      expect(run('https://x.io/api/a', { token: 'abc' }).headers.get('Authorization')).toBe('Bearer abc');
    });

    it('skips invalid tokens', () => {
      expect(run('https://x.io/api/a', { token: 'abc', valid: false }).headers.has('Authorization')).toBe(false);
    });

    it('skips missing tokens', () => {
      expect(run('https://x.io/api/a', null).headers.has('Authorization')).toBe(false);
    });

    it('skips non api urls', () => {
      expect(run('https://x.io/other', { token: 'abc' }).headers.has('Authorization')).toBe(false);
    });
  });

  describe('SignOutDirective', () => {
    @Component({
      standalone: true,
      imports: [ SignOutDirective ],
      template: `<button rxapSignOut (successful)="ok = ok + 1" (failure)="err = $event"></button>`,
    })
    class HostComponent {
      ok = 0;
      err: Error | null = null;
    }

    it('emits successful and failure', async () => {
      const signOut = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('x'));
      TestBed.configureTestingModule({ providers: [ { provide: RxapAuthenticationService, useValue: { signOut } } ] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      btn.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.ok).toBe(1);
      btn.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.err?.message).toBe('x');
    });
  });
});
