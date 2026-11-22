import { TestBed } from '@angular/core/testing';
import {
  AuthenticationAccessToken,
  AuthenticationEvent,
  AuthenticationEventType,
  RXAP_AUTHENTICATION_ACCESS_TOKEN,
  RXAP_AUTHENTICATION_DEACTIVATED,
  RxapAuthenticationService,
} from '@rxap/authentication';
import {
  AUTH_CONFIG,
  OAuthEvent,
  OAuthService,
} from 'angular-oauth2-oidc';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthenticationGuard } from './authentication-guard';
import { AuthenticationService } from './authentication.service';
import { ProvideAuth, withAuthConfig } from './provide-auth';

jest.mock('angular-oauth2-oidc-jwks', () => ({
  JwksValidationHandler: class JwksValidationHandler {},
}));

function createOAuthMock() {
  return {
    events: new Subject<OAuthEvent>(),
    configure: jest.fn(),
    setStorage: jest.fn(),
    setupAutomaticSilentRefresh: jest.fn(),
    loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(true),
    getAccessToken: jest.fn().mockReturnValue('tok'),
    hasValidAccessToken: jest.fn().mockReturnValue(true),
    logOut: jest.fn(),
    initLoginFlow: jest.fn(),
    silentRefreshRedirectUri: '',
    tokenValidationHandler: undefined as unknown,
  };
}

function setup(options: { disabled: boolean; config?: object }) {
  const oauth = createOAuthMock();
  const token$ = new BehaviorSubject<AuthenticationAccessToken | null>(null);
  TestBed.configureTestingModule({
    providers: [
      AuthenticationService,
      { provide: OAuthService, useValue: oauth },
      { provide: RXAP_AUTHENTICATION_ACCESS_TOKEN, useValue: token$ },
      { provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: options.disabled },
      ...(options.config ? [{ provide: AUTH_CONFIG, useValue: options.config }] : []),
    ],
  });
  const service = TestBed.inject(AuthenticationService);
  return { oauth, token$, service };
}

describe('AuthenticationService', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation();
  });
  afterEach(() => warn.mockRestore());

  describe('authentication disabled', () => {
    it('emits success, sets fake token and authenticates', async () => {
      const { token$, service } = setup({ disabled: true });
      expect(token$.value).toEqual({ token: expect.any(String), valid: true });
      expect(await service.isAuthenticated()).toBe(true);
    });

    it('signOut emits logout and unauthenticates', async () => {
      const { service } = setup({ disabled: true });
      const events: AuthenticationEvent[] = [];
      service.events$.subscribe(e => events.push(e));
      await service.signOut();
      expect(events.map(e => e.type)).toEqual([AuthenticationEventType.OnLogout]);
      expect(service.isAuthenticated$.value).toBe(false);
    });

    it('signIn emits success', () => {
      const { service } = setup({ disabled: true });
      service.signOut();
      expect(service.isAuthenticated$.value).toBe(false);
      service.signIn();
      expect(service.isAuthenticated$.value).toBe(true);
    });
  });

  describe('authentication enabled', () => {
    it('configures the oauth service and loads the discovery document', async () => {
      const config = { issuer: 'https://issuer' };
      const { oauth, service } = setup({ disabled: false, config });
      expect(oauth.configure).toHaveBeenCalledWith(config);
      expect(oauth.setStorage).toHaveBeenCalledWith(sessionStorage);
      expect(oauth.tokenValidationHandler).toBeDefined();
      expect(oauth.setupAutomaticSilentRefresh).not.toHaveBeenCalled();
      await Promise.resolve();
      expect(service.isAuthenticated$.value).toBe(true);
    });

    it('skips configure without config and sets up silent refresh when uri set', () => {
      const oauth = createOAuthMock();
      oauth.silentRefreshRedirectUri = 'https://x/silent';
      TestBed.configureTestingModule({
        providers: [
          AuthenticationService,
          { provide: OAuthService, useValue: oauth },
          { provide: RXAP_AUTHENTICATION_ACCESS_TOKEN, useValue: new BehaviorSubject(null) },
          { provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: false },
        ],
      });
      TestBed.inject(AuthenticationService);
      expect(oauth.configure).not.toHaveBeenCalled();
      expect(oauth.setupAutomaticSilentRefresh).toHaveBeenCalled();
    });

    it.each(['token_received', 'token_refreshed', 'silently_refreshed'])('maps %s to success', (type) => {
      const { oauth, token$, service } = setup({ disabled: false });
      const events: AuthenticationEvent[] = [];
      service.events$.subscribe(e => events.push(e));
      oauth.events.next({ type } as OAuthEvent);
      expect(events[0].type).toBe(AuthenticationEventType.OnAuthSuccess);
      expect(token$.value).toEqual({ token: 'tok', valid: true });
      expect(service.isAuthenticated$.value).toBe(true);
    });

    it.each(['token_error', 'silent_refresh_timeout', 'invalid_nonce_in_state'])('maps %s to error', (type) => {
      const { oauth, token$, service } = setup({ disabled: false });
      token$.next({ token: 'x', valid: true });
      const events: AuthenticationEvent[] = [];
      service.events$.subscribe(e => events.push(e));
      oauth.events.next({ type } as OAuthEvent);
      expect(events[0].type).toBe(AuthenticationEventType.OnAuthError);
      expect(token$.value).toBeNull();
    });

    it.each(['token_expires', 'logout', 'session_terminated'])('maps %s to logout', (type) => {
      const { oauth, token$, service } = setup({ disabled: false });
      token$.next({ token: 'x', valid: true });
      const events: AuthenticationEvent[] = [];
      service.events$.subscribe(e => events.push(e));
      oauth.events.next({ type } as OAuthEvent);
      expect(events[0].type).toBe(AuthenticationEventType.OnLogout);
      expect(token$.value).toBeNull();
      expect(service.isAuthenticated$.value).toBe(false);
    });

    it('ignores unhandled events', () => {
      const { oauth, service } = setup({ disabled: false });
      const events: AuthenticationEvent[] = [];
      service.events$.subscribe(e => events.push(e));
      oauth.events.next({ type: 'discovery_document_loaded' } as OAuthEvent);
      expect(events).toEqual([]);
      expect(warn).toHaveBeenCalled();
    });

    it('signIn and signOut delegate to the oauth service', async () => {
      const { oauth, service } = setup({ disabled: false });
      service.signIn();
      await service.signOut();
      expect(oauth.initLoginFlow).toHaveBeenCalled();
      expect(oauth.logOut).toHaveBeenCalled();
    });
  });
});

describe('ProvideAuth', () => {
  it('provides the service under RxapAuthenticationService and appends configs', () => {
    const providers = ProvideAuth(withAuthConfig({ issuer: 'i' }), [withAuthConfig({ issuer: 'j' })]);
    expect(providers[0]).toBe(AuthenticationService);
    expect(providers[1]).toEqual({ provide: RxapAuthenticationService, useExisting: AuthenticationService });
    expect(providers).toHaveLength(4);
    expect(withAuthConfig({ issuer: 'i' })).toEqual({ provide: AUTH_CONFIG, useValue: { issuer: 'i' } });
  });
});

describe('AuthenticationGuard', () => {
  const route = {} as never;
  const state = {} as never;
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation();
  });
  afterEach(() => warn.mockRestore());

  it('allows when auth is disabled', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: true }],
    });
    expect(await TestBed.runInInjectionContext(() => AuthenticationGuard(route, state))).toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it('throws when the service is not the oauth implementation', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: false },
        { provide: RxapAuthenticationService, useValue: {} },
      ],
    });
    await expect(TestBed.runInInjectionContext(() => AuthenticationGuard(route, state))).rejects.toThrow(
      /must be an instance of AuthenticationService/);
  });

  it('allows when authenticated, otherwise signs in', async () => {
    const service = Object.create(AuthenticationService.prototype);
    service.isAuthenticated = jest.fn().mockResolvedValue(true);
    service.signIn = jest.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: RxapAuthenticationService, useValue: service }],
    });
    expect(await TestBed.runInInjectionContext(() => AuthenticationGuard(route, state))).toBe(true);
    expect(service.signIn).not.toHaveBeenCalled();

    service.isAuthenticated.mockResolvedValue(false);
    expect(await TestBed.runInInjectionContext(() => AuthenticationGuard(route, state))).toBe(false);
    expect(service.signIn).toHaveBeenCalled();
  });
});
