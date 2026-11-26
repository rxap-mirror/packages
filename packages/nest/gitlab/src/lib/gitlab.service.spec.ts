import { GitlabService } from './gitlab.service';

// The SDK is replaced by a recording fake: these tests only check how the service talks to it.
const mockConstructed: any[] = [];
jest.mock('@gitbeaker/rest', () => ({
  Gitlab: class FakeGitlab {
    constructor(options: unknown) {
      mockConstructed.push(options);
    }
  },
}));

describe('GitlabService', () => {
  beforeEach(() => {
    mockConstructed.length = 0;
  });

  it('extends the SDK client and hands over host and private token', () => {
    const service = new GitlabService({ host: 'https://git.example.com', token: 'glpat-1' });

    expect(service).toBeInstanceOf(require('@gitbeaker/rest').Gitlab);
    expect(mockConstructed).toEqual([{ host: 'https://git.example.com', token: 'glpat-1' }]);
  });

  it('hands over an oauth token without adding a private token', () => {
    new GitlabService({ host: 'https://gitlab.com', oauthToken: 'oauth-1' });

    expect(mockConstructed).toEqual([{ host: 'https://gitlab.com', oauthToken: 'oauth-1' }]);
    expect(mockConstructed[0]).not.toHaveProperty('token');
  });

  it('hands over options without any token for anonymous access', () => {
    new GitlabService({ host: 'https://gitlab.com' });

    expect(mockConstructed).toEqual([{ host: 'https://gitlab.com' }]);
    expect(Object.keys(mockConstructed[0])).not.toContain('token');
  });

  it('passes other SDK options (camelize, requesterFn, ...) through untouched', () => {
    const requesterFn = jest.fn();
    new GitlabService({ token: 't', camelize: true, requesterFn });

    expect(mockConstructed[0]).toEqual({ token: 't', camelize: true, requesterFn });
  });

  describe('project', () => {
    it('is not forwarded to the SDK (it is not an SDK option)', () => {
      new GitlabService({ token: 't', project: 'group/project' });

      expect(mockConstructed[0]).not.toHaveProperty('project');
    });

    it('exposes the configured project (id or path)', () => {
      expect(new GitlabService({ project: 42 }).project).toBe(42);
      expect(new GitlabService({ project: 'group/project' }).project).toBe('group/project');
    });

    it('requireProject returns the configured project', () => {
      expect(new GitlabService({ project: 'group/project' }).requireProject()).toBe('group/project');
    });

    it('is undefined and requireProject throws a clear error when not configured', () => {
      const service = new GitlabService({});
      expect(service.project).toBeUndefined();
      expect(() => service.requireProject()).toThrow(/GITLAB_PROJECT/);
    });
  });
});
