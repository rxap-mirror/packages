import { Firecrawl } from './Firecrawl.credentials';

describe('Firecrawl credentials', () => {
  const credentials = new Firecrawl();

  it('exposes a password protected api key', () => {
    expect(credentials.name).toBe('firecrawl');
    expect(credentials.properties[0]).toMatchObject({ name: 'apiKey', typeOptions: { password: true } });
  });

  it('authenticates with a bearer token', () => {
    expect(credentials.authenticate.properties.headers).toEqual({
      Authorization: '=Bearer {{$credentials.apiKey}}',
    });
    expect(credentials.test.request.url).toContain('api.firecrawl.dev');
  });
});
