import { OpenWebUIAuth } from './OpenWebUIAuth.credentials';

describe('OpenWebUIAuth credentials', () => {
  const credentials = new OpenWebUIAuth();

  it('extends the bearer auth with a base url', () => {
    expect(credentials.name).toBe('openWebUIAuth');
    const baseUrl = credentials.properties.find((p) => p.name === 'baseUrl');
    expect(baseUrl?.default).toBe('http://open-webui:8080');
  });

  it('tests against the models endpoint', () => {
    expect(credentials.test.request).toEqual({
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v1/models/',
    });
  });
});
