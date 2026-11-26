import { ConfigService } from '@nestjs/config';
import { GitlabModuleOptionsFactory } from './gitlab-module-options.factory';

function createFactory(env: Record<string, string | undefined>) {
  const factory = new GitlabModuleOptionsFactory();
  // property injection: the ConfigService is injected by Nest, assign a fake here
  (factory as any).config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return factory;
}

describe('GitlabModuleOptionsFactory', () => {
  it('defaults the host to https://gitlab.com', async () => {
    const options = await createFactory({}).create();
    expect(options.host).toBe('https://gitlab.com');
  });

  it('maps GITLAB_HOST', async () => {
    const options = await createFactory({ GITLAB_HOST: 'https://git.example.com' }).create();
    expect(options.host).toBe('https://git.example.com');
  });

  it('maps GITLAB_TOKEN to the private token option', async () => {
    const options = await createFactory({ GITLAB_TOKEN: 'glpat-1' }).create();
    expect(options).toMatchObject({ token: 'glpat-1' });
    expect(options).not.toHaveProperty('oauthToken');
  });

  it('maps GITLAB_OAUTH_TOKEN to the oauth (bearer) token option', async () => {
    const options = await createFactory({ GITLAB_OAUTH_TOKEN: 'oauth-1' }).create();
    expect(options).toMatchObject({ oauthToken: 'oauth-1' });
    expect(options).not.toHaveProperty('token');
  });

  // The SDK checks `'token' in options`; an `undefined` value would still send an
  // (empty) PRIVATE-TOKEN header. Absent configuration must mean an absent key.
  it('does not set any token key without a token (anonymous access)', async () => {
    const options = await createFactory({}).create();
    expect(Object.keys(options)).not.toContain('token');
    expect(Object.keys(options)).not.toContain('oauthToken');
    expect(Object.keys(options)).not.toContain('project');
  });

  it('treats empty strings as not configured', async () => {
    const options = await createFactory({ GITLAB_TOKEN: '', GITLAB_OAUTH_TOKEN: '', GITLAB_PROJECT: '' }).create();
    expect(Object.keys(options).sort()).toEqual(['host']);
  });

  it('refuses to guess when both token kinds are configured (no fallback)', async () => {
    await expect(createFactory({ GITLAB_TOKEN: 'a', GITLAB_OAUTH_TOKEN: 'b' }).create()).rejects.toThrow(
      /GITLAB_TOKEN.*GITLAB_OAUTH_TOKEN/,
    );
  });

  it('maps GITLAB_PROJECT (id or path) to the project option', async () => {
    expect(await createFactory({ GITLAB_PROJECT: '1234' }).create()).toMatchObject({ project: '1234' });
    expect(await createFactory({ GITLAB_PROJECT: 'group/sub/project' }).create()).toMatchObject({
      project: 'group/sub/project',
    });
  });
});
