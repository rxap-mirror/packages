import { Auth0AuthenticationService } from './auth0-authentication.service';
import { Auth0ManagementService } from './auth0-management.service';
import { Auth0Service } from './auth0.service';
import { Auth0Bypass, AUTH0_BYPASS_KEY } from './auth0-bypass';

const opts = { domain: 'd.auth0.com', clientId: 'id', clientSecret: 's' };

describe.each([
  ['Auth0AuthenticationService', Auth0AuthenticationService],
  ['Auth0Service', Auth0Service],
])('%s', (_name, Cls) => {
  it('requests a client credentials token for the audience', async () => {
    const service = new Cls(opts);
    const grant = jest
      .spyOn(service.oauth, 'clientCredentialsGrant')
      .mockResolvedValue({ data: { access_token: 'tok' } } as any);
    await expect(service.requestToken('https://api')).resolves.toBe('tok');
    expect(grant).toHaveBeenCalledWith({ audience: 'https://api' });
  });
});

describe('Auth0ManagementService', () => {
  it('can be constructed with a token', () => {
    const service = new Auth0ManagementService({ domain: 'd.auth0.com', token: 't' });
    expect(service).toBeInstanceOf(Auth0ManagementService);
  });
});

describe('Auth0Bypass', () => {
  it('sets the bypass metadata', () => {
    class T {}
    Auth0Bypass()(T);
    expect(Reflect.getMetadata(AUTH0_BYPASS_KEY, T)).toBe(true);
  });
});
