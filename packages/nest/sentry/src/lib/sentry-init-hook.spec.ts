import * as Sentry from '@sentry/nestjs';
import { sentryInitHook } from './sentry-init-hook';

jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(() => 'client'),
  captureConsoleIntegration: jest.fn(() => 'console-integration'),
}));
jest.mock('@sentry/profiling-node', () => ({ nodeProfilingIntegration: jest.fn(() => 'profiling') }));

describe('sentryInitHook', () => {

  const init = Sentry.init as jest.Mock;
  const keys = [ 'SENTRY_DSN', 'SENTRY_ENABLED', 'SENTRY_DEBUG', 'ENVIRONMENT' ];
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of keys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    init.mockClear();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    for (const key of keys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
    jest.restoreAllMocks();
  });

  it('should warn without dsn and initialize disabled', () => {
    sentryInitHook()({}, {} as any);
    expect(console.warn).toHaveBeenCalledWith('No sentry dsn provided.');
    const options = init.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    expect(options.debug).toBe(false);
    expect(options.integrations).toEqual([ 'console-integration', 'profiling' ]);
  });

  it('should read from the environment object', () => {
    sentryInitHook()({}, { tier: 'production', tag: 'v1.0.0', sentry: { dsn: 'dsn', enabled: true, debug: true } } as any);
    const options = init.mock.calls[0][0];
    expect(options).toEqual(expect.objectContaining({
      dsn: 'dsn', enabled: true, debug: true, environment: 'production', release: '1.0.0',
    }));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should prefer process env variables and custom options and call the callback', () => {
    process.env['SENTRY_DSN'] = 'env-dsn';
    process.env['SENTRY_ENABLED'] = 'true';
    process.env['SENTRY_DEBUG'] = 'true';
    process.env['ENVIRONMENT'] = 'custom';
    const callback = jest.fn();
    const environment = { sentry: { dsn: 'dsn' } } as any;
    sentryInitHook({ tracesSampleRate: 0.5 }, callback)('app-options', environment);
    expect(init.mock.calls[0][0]).toEqual(expect.objectContaining({
      dsn: 'env-dsn', enabled: true, debug: true, environment: 'custom', tracesSampleRate: 0.5,
    }));
    expect(callback).toHaveBeenCalledWith('client', 'app-options', environment);
  });

});
