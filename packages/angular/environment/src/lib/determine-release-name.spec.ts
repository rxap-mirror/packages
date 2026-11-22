import { DetermineReleaseName } from './determine-release-name';

describe('DetermineReleaseName', () => {
  const env = { app: 'a', production: false };

  it('uses the tag first', () => {
    expect(DetermineReleaseName({ ...env, tag: 'v1.0.0', branch: 'main' })).toBe('v1.0.0');
  });

  it('uses the branch if no tag', () => {
    expect(DetermineReleaseName({ ...env, branch: 'main' })).toBe('main');
  });

  it('uses the default name', () => {
    expect(DetermineReleaseName(env)).toBe('local-development');
    expect(DetermineReleaseName(env, 'x')).toBe('x');
  });
});
