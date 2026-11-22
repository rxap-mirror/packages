import { DetermineProductionEnvironmentName } from './determine-production-environment-name';
import { Environment } from './environment';

const base: Environment = { app: 'test', production: true };

describe('DetermineProductionEnvironmentName', () => {
  it('prefers the tier', () => {
    expect(DetermineProductionEnvironmentName({ ...base, tier: 'staging', tag: 'v1.0.0', branch: 'main' })).toBe('staging');
  });

  it('returns production for a plain release tag', () => {
    expect(DetermineProductionEnvironmentName({ ...base, tag: 'v1.2.3' })).toBe('production');
  });

  it('returns the channel of a prerelease tag', () => {
    expect(DetermineProductionEnvironmentName({ ...base, tag: 'v1.2.3-beta.4' })).toBe('beta');
  });

  it('returns undefined for an invalid tag', () => {
    expect(DetermineProductionEnvironmentName({ ...base, tag: 'foo', branch: 'main' })).toBeUndefined();
  });

  it('falls back to the branch', () => {
    expect(DetermineProductionEnvironmentName({ ...base, branch: 'develop' })).toBe('develop');
  });

  it('returns undefined without any information', () => {
    expect(DetermineProductionEnvironmentName(base)).toBeUndefined();
  });
});
