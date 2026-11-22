import { UpdateEnvironment } from './update-environment';

describe('UpdateEnvironment', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('merges the loaded build.json into the environment', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ tag: 'v1', commit: 'abc' }) });
    global.fetch = fetchMock as any;
    const env: any = { app: 'a', production: true };
    await UpdateEnvironment(env);
    expect(fetchMock).toHaveBeenCalledWith('build.json');
    expect(env).toMatchObject({ app: 'a', tag: 'v1', commit: 'abc' });
  });

  it('uses a custom url', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as any;
    await UpdateEnvironment({ app: 'a', production: true }, 'x.json');
    expect(fetchMock).toHaveBeenCalledWith('x.json');
  });

  it('logs and keeps the environment on a failed response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;
    const env: any = { app: 'a', production: true };
    await UpdateEnvironment(env);
    expect(console.error).toHaveBeenCalledWith('Could not load build.json');
    expect(env).toEqual({ app: 'a', production: true });
  });
});
