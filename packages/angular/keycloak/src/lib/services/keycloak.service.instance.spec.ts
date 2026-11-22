import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { KeycloakEventType } from '../interfaces/keycloak-event';
import { KeycloakService } from './keycloak.service';

const mockInstance: any = {};
let ctorArgs: any;

jest.mock('keycloak-js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((config: any) => {
    ctorArgs = config;
    return mockInstance;
  }),
}));

function resetInstance() {
  for (const k of Object.keys(mockInstance)) delete mockInstance[k];
  Object.assign(mockInstance, {
    authenticated: true,
    token: 'tok',
    init: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined),
    updateToken: jest.fn().mockResolvedValue(true),
    isTokenExpired: jest.fn().mockReturnValue(false),
    loadUserProfile: jest.fn().mockResolvedValue({ username: 'jane' }),
    clearToken: jest.fn(),
    hasResourceRole: jest.fn().mockReturnValue(false),
    hasRealmRole: jest.fn().mockReturnValue(false),
    resourceAccess: { a: { roles: ['r1', 'r2'] }, b: {} },
    realmAccess: { roles: ['realm'] },
  });
}

describe('KeycloakService (instance)', () => {
  let service: KeycloakService;

  beforeEach(() => {
    resetInstance();
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeycloakService);
  });

  describe('init', () => {
    it('creates the instance, applies defaults and returns the auth state', async () => {
      const result = await service.init({ config: { url: 'u', realm: 'r', clientId: 'c' } });
      expect(result).toBe(true);
      expect(ctorArgs).toEqual({ url: 'u', realm: 'r', clientId: 'c' });
      expect(mockInstance.init).toHaveBeenCalledWith({});
      expect(service.enableBearerInterceptor).toBe(true);
      expect(service.excludedUrls).toEqual([]);
      expect(service.getKeycloakInstance()).toBe(mockInstance);
      expect(mockInstance.loadUserProfile).not.toHaveBeenCalled();
    });

    it('loads the profile at startup if requested and authenticated', async () => {
      await service.init({ loadUserProfileAtStartUp: true });
      expect(mockInstance.loadUserProfile).toHaveBeenCalled();
      expect(service.getUsername()).toBe('jane');
    });

    it('does not load the profile if not authenticated', async () => {
      mockInstance.init.mockResolvedValue(false);
      await service.init({ loadUserProfileAtStartUp: true });
      expect(mockInstance.loadUserProfile).not.toHaveBeenCalled();
    });

    it('builds excluded url patterns', async () => {
      await service.init({ bearerExcludedUrls: ['/assets', { url: '/api', httpMethods: ['GET'] }] });
      expect(service.excludedUrls).toHaveLength(2);
    });

    it('forwards keycloak callbacks as events', async () => {
      await service.init();
      const events: any[] = [];
      service.keycloakEvents$.subscribe((e) => events.push(e));
      mockInstance.onAuthError('err');
      mockInstance.onAuthLogout();
      mockInstance.onAuthRefreshSuccess();
      mockInstance.onAuthRefreshError();
      mockInstance.onAuthSuccess();
      mockInstance.onTokenExpired();
      mockInstance.onActionUpdate('state');
      mockInstance.onReady(true);
      expect(events.map((e) => e.type)).toEqual([
        KeycloakEventType.OnAuthError,
        KeycloakEventType.OnAuthLogout,
        KeycloakEventType.OnAuthRefreshSuccess,
        KeycloakEventType.OnAuthRefreshError,
        KeycloakEventType.OnAuthSuccess,
        KeycloakEventType.OnTokenExpired,
        KeycloakEventType.OnActionUpdate,
        KeycloakEventType.OnReady,
      ]);
      expect(events[0].args).toBe('err');
      expect(events[7].args).toBe(true);
    });

    it('resolves isReady on the ready event', async () => {
      await service.init();
      mockInstance.onReady(true);
      await expect(service.isReady).resolves.toBe(true);
    });
  });

  describe('after init', () => {
    beforeEach(async () => {
      await service.init({ loadUserProfileAtStartUp: true });
    });

    it('login reloads the profile when configured', async () => {
      mockInstance.loadUserProfile.mockClear();
      await service.login({ scope: 's' });
      expect(mockInstance.login).toHaveBeenCalledWith({ scope: 's' });
      // profile is cached, so no reload
      expect(mockInstance.loadUserProfile).not.toHaveBeenCalled();
    });

    it('logout clears the profile', async () => {
      await service.logout('http://x');
      expect(mockInstance.logout).toHaveBeenCalledWith({ redirectUri: 'http://x' });
      expect(() => service.getUsername()).toThrow('User not logged in');
    });

    it('register defaults to the register action', async () => {
      await service.register();
      expect(mockInstance.register).toHaveBeenCalledWith({ action: 'register' });
    });

    it('checks resource then realm roles', () => {
      expect(service.isUserInRole('x')).toBe(false);
      expect(mockInstance.hasRealmRole).toHaveBeenCalledWith('x');
      mockInstance.hasResourceRole.mockReturnValue(true);
      mockInstance.hasRealmRole.mockClear();
      expect(service.isUserInRole('x', 'res')).toBe(true);
      expect(mockInstance.hasRealmRole).not.toHaveBeenCalled();
    });

    it('collects roles', () => {
      expect(service.getUserRoles()).toEqual(['r1', 'r2', 'realm']);
      expect(service.getUserRoles(false)).toEqual(['r1', 'r2']);
      mockInstance.resourceAccess = undefined;
      mockInstance.realmAccess = {};
      expect(service.getUserRoles()).toEqual([]);
    });

    it('isLoggedIn handles unauthenticated, ok and failing refresh', async () => {
      mockInstance.authenticated = false;
      await expect(service.isLoggedIn()).resolves.toBe(false);
      mockInstance.authenticated = true;
      await expect(service.isLoggedIn()).resolves.toBe(true);
      expect(mockInstance.updateToken).toHaveBeenCalledWith(20);
      mockInstance.updateToken.mockRejectedValue(new Error('x'));
      await expect(service.isLoggedIn()).resolves.toBe(false);
    });

    it('delegates isTokenExpired and clearToken', () => {
      service.isTokenExpired(5);
      expect(mockInstance.isTokenExpired).toHaveBeenCalledWith(5);
      service.clearToken();
      expect(mockInstance.clearToken).toHaveBeenCalled();
    });

    it('loadUserProfile caches, reloads on force and requires authentication', async () => {
      mockInstance.loadUserProfile.mockClear();
      await service.loadUserProfile();
      expect(mockInstance.loadUserProfile).not.toHaveBeenCalled();
      await service.loadUserProfile(true);
      expect(mockInstance.loadUserProfile).toHaveBeenCalledTimes(1);
      mockInstance.authenticated = false;
      await expect(service.loadUserProfile(true)).rejects.toThrow('not logged in');
    });

    it('getToken refreshes with 10s validity', async () => {
      await expect(service.getToken()).resolves.toBe('tok');
      expect(mockInstance.updateToken).toHaveBeenCalledWith(10);
    });

    it('addTokenToHeader sets the bearer header', async () => {
      const headers = await new Promise<HttpHeaders>((resolve) => service.addTokenToHeader().subscribe(resolve));
      expect(headers.get('Authorization')).toBe('Bearer tok');
    });

    it('addTokenToHeader keeps headers without token', async () => {
      mockInstance.token = undefined;
      const base = new HttpHeaders({ a: 'b' });
      const headers = await new Promise<HttpHeaders>((resolve) => service.addTokenToHeader(base).subscribe(resolve));
      expect(headers).toBe(base);
    });
  });

  describe('updateToken', () => {
    it('throws if not initialized', async () => {
      await expect(service.updateToken()).rejects.toThrow('not initialized');
    });

    it('delegates to keycloak with the minimal validity', async () => {
      await service.init();
      await service.updateToken(7);
      expect(mockInstance.updateToken).toHaveBeenCalledWith(7);
    });

    it('with implicit flow only validates the token', async () => {
      await service.init({ initOptions: { flow: 'implicit' } });
      await expect(service.updateToken()).resolves.toBe(true);
      expect(mockInstance.updateToken).not.toHaveBeenCalled();
      mockInstance.isTokenExpired.mockReturnValue(true);
      await expect(service.updateToken()).rejects.toThrow('Failed to refresh');
    });
  });

  it('getUsername throws without profile', () => {
    expect(() => service.getUsername()).toThrow('User not logged in');
  });
});
