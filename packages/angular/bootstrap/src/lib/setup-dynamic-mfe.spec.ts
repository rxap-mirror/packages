import { getRemoteUrl, setRemoteDefinitions } from './remote-resolver';
import { SetupDynamicMfe } from './setup-dynamic-mfe';

describe('SetupDynamicMfe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // definitions take precedence over the url resolver, so reset them
    setRemoteDefinitions({});
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [{ tag: 'v1.0.0', branch: 'b' }, 'v1.0.0'],
    [{ branch: 'feat' }, 'feat'],
    [{}, 'latest'],
  ])('registers a url resolver without manifest (%j)', async (env, release) => {
    await SetupDynamicMfe(env as any);
    expect(getRemoteUrl('shell')).toBe(`${location.origin}/__mfe/${release}/shell`);
  });

  it('uses an inline manifest object', async () => {
    const manifest = { a: 'http://a' };
    await SetupDynamicMfe({ moduleFederation: { manifest } } as any);
    expect(getRemoteUrl('a')).toBe('http://a');
  });

  it('fetches a manifest url', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ b: 'http://b' }) });
    vi.stubGlobal('fetch', fetchMock);
    await SetupDynamicMfe({ moduleFederation: { manifest: '/mf.json' } } as any);
    expect(fetchMock).toHaveBeenCalledWith('/mf.json');
    expect(getRemoteUrl('b')).toBe('http://b');
  });
});
