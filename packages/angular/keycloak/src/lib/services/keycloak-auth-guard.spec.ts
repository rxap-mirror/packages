import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard } from './keycloak-auth-guard';

class TestGuard extends KeycloakAuthGuard {
  result: boolean | UrlTree = true;
  seen?: { authenticated?: boolean };

  async isAccessAllowed(): Promise<boolean | UrlTree> {
    this.seen = { authenticated: this.authenticated };
    return this.result;
  }

  get state() {
    return { authenticated: this.authenticated, roles: this.roles };
  }
}

describe('KeycloakAuthGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  let kc: any;
  let guard: TestGuard;

  beforeEach(() => {
    kc = {
      isReady: Promise.resolve(true),
      isLoggedIn: vi.fn().mockResolvedValue(true),
      getUserRoles: vi.fn().mockReturnValue(['a']),
    };
    guard = new TestGuard({} as any, kc);
  });

  it('sets authenticated and roles when access is allowed', async () => {
    await expect(guard.canActivate(route, state)).resolves.toBe(true);
    expect(guard.seen?.authenticated).toBe(true);
    expect(guard.state).toEqual({ authenticated: true, roles: ['a'] });
    expect(kc.getUserRoles).toHaveBeenCalledWith(true);
  });

  it('does not load roles when access is denied', async () => {
    guard.result = false;
    await expect(guard.canActivate(route, state)).resolves.toBe(false);
    expect(guard.state.roles).toBeUndefined();
  });

  it('passes through a redirect UrlTree', async () => {
    const tree = {} as UrlTree;
    guard.result = tree;
    await expect(guard.canActivate(route, state)).resolves.toBe(tree);
  });

  it('rejects with a message on error', async () => {
    kc.isLoggedIn.mockRejectedValue(new Error('boom'));
    await expect(guard.canActivate(route, state)).rejects.toContain('An error happened during access validation');
  });
});
