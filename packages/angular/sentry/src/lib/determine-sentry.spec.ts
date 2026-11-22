import { DetermineSentryEnvironment } from './determine-sentry-environment';
import { DetermineSentryRelease } from './determine-sentry-release';

describe('DetermineSentryEnvironment', () => {
  it('returns undefined for local and unknown tiers', () => {
    expect(DetermineSentryEnvironment({ tier: 'local' } as any)).toBeUndefined();
    expect(DetermineSentryEnvironment({ tier: 'staging' } as any)).toBeUndefined();
  });

  it('derives the production name', () => {
    expect(DetermineSentryEnvironment({ tier: 'production' } as any)).toBe('production');
  });
});

describe('DetermineSentryRelease', () => {
  it('returns undefined for local/unknown tiers', () => {
    expect(DetermineSentryRelease({ tier: 'local', tag: 'v1.0.0' } as any)).toBeUndefined();
    expect(DetermineSentryRelease({ tier: 'weird', tag: 'v1.0.0' } as any)).toBeUndefined();
  });

  it.each(['development', 'testing', 'staging', 'production'])('strips the v prefix on %s', (tier) => {
    expect(DetermineSentryRelease({ tier, tag: 'v1.2.3-rc.1' } as any)).toBe('1.2.3-rc.1');
  });

  it('keeps non semver tags and handles missing tags', () => {
    expect(DetermineSentryRelease({ tier: 'staging', tag: 'abc' } as any)).toBe('abc');
    expect(DetermineSentryRelease({ tier: 'staging' } as any)).toBeUndefined();
  });
});
