import { setRemoteDefinitions, setRemoteUrlResolver } from './remote-resolver';
import { SetupDynamicMfe } from './setup-dynamic-mfe';

jest.mock('./remote-resolver', () => ({
  setRemoteDefinitions: jest.fn(),
  setRemoteUrlResolver: jest.fn(),
}));

describe('SetupDynamicMfe', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [{ tag: 'v1.0.0', branch: 'b' }, 'v1.0.0'],
    [{ branch: 'feat' }, 'feat'],
    [{}, 'latest'],
  ])('registers a url resolver without manifest (%j)', async (env, release) => {
    await SetupDynamicMfe(env as any);
    const resolver = (setRemoteUrlResolver as jest.Mock).mock.calls[0][0];
    expect(resolver('shell')).toBe(`${location.origin}/__mfe/${release}/shell`);
    expect(setRemoteDefinitions).not.toHaveBeenCalled();
  });

  it('uses an inline manifest object', async () => {
    const manifest = { a: 'http://a' };
    await SetupDynamicMfe({ moduleFederation: { manifest } } as any);
    expect(setRemoteDefinitions).toHaveBeenCalledWith(manifest);
  });

  it('fetches a manifest url', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => ({ b: 'http://b' }) });
    await SetupDynamicMfe({ moduleFederation: { manifest: '/mf.json' } } as any);
    expect(fetch).toHaveBeenCalledWith('/mf.json');
    expect(setRemoteDefinitions).toHaveBeenCalledWith({ b: 'http://b' });
    delete (global as any).fetch;
  });
});
