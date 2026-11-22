import { DetermineSentryEnvironment } from './determine-sentry-environment';
import { DetermineSentryRelease } from './determine-sentry-release';
import { GetSentryLogLevels } from './get-sentry-log-levels';
import { sentryValidationSchema } from './sentry-app-config';

describe('DetermineSentryEnvironment', () => {
  it('should return undefined for local and unknown tiers', () => {
    expect(DetermineSentryEnvironment({ tier: 'local' } as any)).toBeUndefined();
    expect(DetermineSentryEnvironment({ tier: 'staging' } as any)).toBeUndefined();
    expect(DetermineSentryEnvironment({} as any)).toBeUndefined();
  });

  it('should determine the production environment', () => {
    expect(DetermineSentryEnvironment({ tier: 'production' } as any)).toBe('production');
  });
});

describe('DetermineSentryRelease', () => {
  it.each([ 'local', 'unknown', undefined ])('should return undefined for tier %s', (tier) => {
    expect(DetermineSentryRelease({ tier, tag: 'v1.0.0' } as any)).toBeUndefined();
  });

  it.each([ 'development', 'testing', 'staging', 'production' ])('should strip the v prefix of semver tags in %s', (tier) => {
    expect(DetermineSentryRelease({ tier, tag: 'v1.2.3-beta.1' } as any)).toBe('1.2.3-beta.1');
  });

  it('should return other tags unchanged or undefined', () => {
    expect(DetermineSentryRelease({ tier: 'production', tag: 'nightly' } as any)).toBe('nightly');
    expect(DetermineSentryRelease({ tier: 'production' } as any)).toBeUndefined();
  });
});

describe('GetSentryLogLevels', () => {
  beforeEach(() => jest.spyOn(console, 'debug').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [ 'verbose', [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ] ],
    [ 'TRACE', [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ] ],
    [ 'debug', [ 'debug', 'info', 'warn', 'error', 'fatal' ] ],
    [ 'log', [ 'info', 'warn', 'error', 'fatal' ] ],
    [ 'info', [ 'info', 'warn', 'error', 'fatal' ] ],
    [ 'warn', [ 'warn', 'error', 'fatal' ] ],
    [ 'unknown', [ 'warn', 'error', 'fatal' ] ],
    [ 'error', [ 'error', 'fatal' ] ],
    [ 'fatal', [ 'fatal' ] ],
  ])('should map %s', (level, expected) => {
    expect(GetSentryLogLevels(level)).toEqual(expected);
  });

  it('should read the level from the environment by default', () => {
    process.env['SENTRY_LOG_LEVEL'] = 'error';
    try {
      expect(GetSentryLogLevels()).toEqual([ 'error', 'fatal' ]);
    } finally {
      delete process.env['SENTRY_LOG_LEVEL'];
    }
  });
});

describe('sentryValidationSchema', () => {
  it('should create defaults', () => {
    const schema = sentryValidationSchema({} as any);
    expect(Object.keys(schema)).toEqual([ 'SENTRY_LOG_LEVEL', 'SENTRY_ENABLED' ]);
    expect((schema['SENTRY_LOG_LEVEL'] as any).validate(undefined).value).toBe('warn');
    expect((schema['SENTRY_ENABLED'] as any).validate(undefined).value).toBe(false);
  });

  it('should honor environment and options', () => {
    const schema = sentryValidationSchema({ sentry: { enabled: true } } as any, { logLevel: 'error' });
    expect((schema['SENTRY_LOG_LEVEL'] as any).validate(undefined).value).toBe('error');
    expect((schema['SENTRY_ENABLED'] as any).validate(undefined).value).toBe(true);
    const override = sentryValidationSchema({ sentry: { enabled: true } } as any, { enabled: false });
    expect((override['SENTRY_ENABLED'] as any).validate(undefined).value).toBe(false);
  });
});
