import { IsNotReleaseVersion } from './is-not-release-version';

describe('IsNotReleaseVersion', () => {
  const env = { app: 'a', production: true };

  it('is true without tag', () => {
    expect(IsNotReleaseVersion(env)).toBe(true);
  });

  it('is true if tier is not production', () => {
    expect(IsNotReleaseVersion({ ...env, tag: 'v1.0.0', tier: 'staging' })).toBe(true);
  });

  it('is true for an invalid tag', () => {
    expect(IsNotReleaseVersion({ ...env, tag: 'abc', tier: 'production' })).toBe(true);
  });

  it('is true for a prerelease tag', () => {
    expect(IsNotReleaseVersion({ ...env, tag: 'v1.0.0-rc.1', tier: 'production' })).toBe(true);
  });

  it('is false for a production release tag', () => {
    expect(IsNotReleaseVersion({ ...env, tag: 'v1.0.0', tier: 'production' })).toBe(false);
  });
});
