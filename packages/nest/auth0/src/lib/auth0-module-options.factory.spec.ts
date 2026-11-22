import { Auth0ModuleOptionsFactory } from './auth0-module-options.factory';

describe('Auth0ModuleOptionsFactory', () => {
  const build = (env: Record<string, any>) => {
    const factory = new Auth0ModuleOptionsFactory();
    Object.assign(factory as any, {
      config: { get: jest.fn((k: string, d?: any) => env[k] ?? d) },
      logger: { verbose: jest.fn() },
    });
    return factory;
  };

  it('uses client credentials for management without a token', async () => {
    const options = await build({
      AUTH0_DOMAIN: 'd.auth0.com',
      AUTH0_CLIENT_ID: 'id',
      AUTH0_CLIENT_SECRET: 'secret',
    }).create();
    expect(options.authentication).toEqual({ domain: 'd.auth0.com', clientId: 'id', clientSecret: 'secret' });
    expect(options.management).toEqual({ domain: 'd.auth0.com', clientId: 'id', clientSecret: 'secret' });
    expect(options.disabled).toBe(false);
  });

  it('uses the management token when configured', async () => {
    const options = await build({
      AUTH0_DOMAIN: 'd.auth0.com',
      AUTH0_MANAGEMENT_TOKEN: 'tok',
      AUTH0_DISABLED: true,
    }).create();
    expect(options.management).toEqual({ domain: 'd.auth0.com', token: 'tok' });
    expect(options.disabled).toBe(true);
  });
});
