import { GitbeakerRequestError } from '@gitbeaker/requester-utils';
import { GitlabService } from './gitlab.service';

// The SDK itself is real (constructing it does no I/O); the network is replaced by a fake `fetch`.
const FINGERPRINT_HEADERS = {
  'x-gitlab-blob-id': 'blob-1',
  'x-gitlab-commit-id': 'commit-1',
  'x-gitlab-content-sha256': 'sha-1',
  'x-gitlab-encoding': 'base64',
  'x-gitlab-file-name': 'design.fig',
  'x-gitlab-file-path': 'designs/design.fig',
  'x-gitlab-last-commit-id': 'last-commit-1',
  'x-gitlab-ref': 'main',
  'x-gitlab-size': '5242880',
  'x-gitlab-execute-filemode': 'false',
};

function headResponse(status = 200, headers: Record<string, string> = FINGERPRINT_HEADERS) {
  return new Response(null, { status, statusText: status === 200 ? 'OK' : 'Error', headers });
}

describe('GitlabService#getFileFingerprint', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => headResponse());
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  const lastRequest = () => {
    const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    return { url: String(url), init: init as RequestInit, headers: new Headers(init?.headers) };
  };

  it('asks with HEAD (no body download) for the encoded project, file path and ref', async () => {
    const service = new GitlabService({ token: 't' });

    await service.getFileFingerprint('designs/my file.fig', 'feature/x', 'group/sub/project');

    const { url, init } = lastRequest();
    expect(init.method).toBe('HEAD');
    expect(url).toBe(
      'https://gitlab.com/api/v4/projects/group%2Fsub%2Fproject/repository/files/designs%2Fmy%20file.fig?ref=feature%2Fx',
    );
  });

  it('uses the configured host', async () => {
    await new GitlabService({ host: 'https://git.example.com', token: 't' }).getFileFingerprint('a', 'main', 1);

    expect(lastRequest().url).toBe('https://git.example.com/api/v4/projects/1/repository/files/a?ref=main');
  });

  it('falls back to the configured project when none is given', async () => {
    await new GitlabService({ token: 't', project: 'g/p' }).getFileFingerprint('a.txt', 'main');

    expect(lastRequest().url).toContain('/projects/g%2Fp/repository/files/a.txt');
  });

  it('throws without an explicit or configured project', async () => {
    await expect(new GitlabService({ token: 't' }).getFileFingerprint('a', 'main')).rejects.toThrow(/GITLAB_PROJECT/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads the fingerprint from the response headers', async () => {
    const fingerprint = await new GitlabService({ token: 't' }).getFileFingerprint('designs/design.fig', 'main', 1);

    expect(fingerprint).toEqual({
      contentSha256: 'sha-1',
      blobId: 'blob-1',
      commitId: 'commit-1',
      lastCommitId: 'last-commit-1',
      fileName: 'design.fig',
      filePath: 'designs/design.fig',
      ref: 'main',
      size: 5242880,
      encoding: 'base64',
      executeFilemode: false,
    });
  });

  it('authenticates with the PRIVATE-TOKEN header for a private token', async () => {
    await new GitlabService({ token: 'glpat-1' }).getFileFingerprint('a', 'main', 1);

    expect(lastRequest().headers.get('private-token')).toBe('glpat-1');
    expect(lastRequest().headers.get('authorization')).toBeNull();
  });

  it('authenticates with a bearer Authorization header for an oauth token', async () => {
    await new GitlabService({ oauthToken: 'oauth-1' }).getFileFingerprint('a', 'main', 1);

    expect(lastRequest().headers.get('authorization')).toBe('Bearer oauth-1');
    expect(lastRequest().headers.get('private-token')).toBeNull();
  });

  it('resolves a dynamic (function) token on every call', async () => {
    // a plain function: the SDK checks `instanceof Function`, which a jest mock fails across realms
    const tokens = ['first', 'second'];
    const token = async () => tokens.shift() as string;
    const service = new GitlabService({ token });

    await service.getFileFingerprint('a', 'main', 1);
    expect(lastRequest().headers.get('private-token')).toBe('first');
    await service.getFileFingerprint('a', 'main', 1);
    expect(lastRequest().headers.get('private-token')).toBe('second');
  });

  it('sends no credentials without a token', async () => {
    await new GitlabService({}).getFileFingerprint('a', 'main', 1);

    expect(lastRequest().headers.get('private-token')).toBeNull();
    expect(lastRequest().headers.get('authorization')).toBeNull();
  });

  it('returns null when the file does not exist (404)', async () => {
    fetchMock.mockImplementation(async () => headResponse(404, {}));

    await expect(new GitlabService({ token: 't' }).getFileFingerprint('missing', 'main', 1)).resolves.toBeNull();
  });

  it.each([401, 403, 500])('throws the SDK request error for status %s', async (status) => {
    fetchMock.mockImplementation(async () => headResponse(status, {}));

    const error = await new GitlabService({ token: 't' }).getFileFingerprint('a', 'main', 1).catch((e) => e);

    expect(error).toBeInstanceOf(GitbeakerRequestError);
    expect(error.cause.response.status).toBe(status);
  });

  it('throws when a successful response lacks the content hash header', async () => {
    fetchMock.mockImplementation(async () => headResponse(200, { 'x-gitlab-blob-id': 'b' }));

    await expect(new GitlabService({ token: 't' }).getFileFingerprint('a', 'main', 1)).rejects.toThrow(
      /x-gitlab-content-sha256/i,
    );
  });

  it('propagates network errors', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(new GitlabService({ token: 't' }).getFileFingerprint('a', 'main', 1)).rejects.toThrow('fetch failed');
  });
});

describe('GitlabService (real SDK wiring)', () => {
  it('reports credentials only when a token is configured', () => {
    expect(new GitlabService({ token: 't' }).hasCredentials).toBe(true);
    expect(new GitlabService({ oauthToken: 't' }).hasCredentials).toBe(true);
    expect(new GitlabService({}).hasCredentials).toBe(false);
  });

  it('uses the SDK default host', () => {
    expect(new GitlabService({}).url).toBe('https://gitlab.com/api/v4/');
  });
});
