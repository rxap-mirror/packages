import { UpdateEnvironment } from './update-environment';

describe('UpdateEnvironment', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('merges the loaded build.json into the environment', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ tag: 'v1', commit: 'abc' }) });
    global.fetch = fetchMock as any;
    const env: any = { app: 'a', production: true };
    await UpdateEnvironment(env);
    expect(fetchMock).toHaveBeenCalledWith('build.json');
    expect(env).toMatchObject({ app: 'a', tag: 'v1', commit: 'abc' });
  });

  it('uses a custom url', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as any;
    await UpdateEnvironment({ app: 'a', production: true }, 'x.json');
    expect(fetchMock).toHaveBeenCalledWith('x.json');
  });

  it('logs and keeps the environment on a failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    const env: any = { app: 'a', production: true };
    await UpdateEnvironment(env);
    expect(console.error).toHaveBeenCalledWith('Could not load build.json');
    expect(env).toEqual({ app: 'a', production: true });
  });
});
