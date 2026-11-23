import type { Mock } from 'vitest';
import { sentryInitBootstrapHook } from './sentry-init-bootstrap-hook';
import * as Sentry from '@sentry/angular';

vi.mock('@sentry/angular', () => {
  const integration = (name: string) => vi.fn((opts?: unknown) => ({ name, opts }));
  return {
    init: vi.fn(),
    makeBrowserOfflineTransport: vi.fn(() => 'offline'),
    makeFetchTransport: vi.fn(),
    browserTracingIntegration: integration('tracing'),
    browserProfilingIntegration: integration('profiling'),
    browserSessionIntegration: integration('session'),
    captureConsoleIntegration: integration('console'),
    extraErrorDataIntegration: integration('extra'),
    httpClientIntegration: integration('http'),
    reportingObserverIntegration: integration('reporting'),
    replayIntegration: integration('replay'),
    feedbackIntegration: integration('feedback'),
  };
});

function makeConfig(values: Record<string, unknown> = {}) {
  return {
    get: vi.fn((key: string, def?: unknown) => (key in values ? values[key] : def)),
  } as any;
}

describe('sentryInitBootstrapHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('warns without dsn and initializes with defaults', () => {
    sentryInitBootstrapHook({ tier: 'local' } as any)(makeConfig());
    expect(console.warn).toHaveBeenCalledWith('No sentry dsn provided.');
    const opts = (Sentry.init as Mock).mock.calls[0][0];
    expect(opts.enabled).toBe(false);
    expect(opts.debug).toBe(false);
    expect(opts.integrations).toHaveLength(7);
    expect(opts.initialScope.tags.origin).toBe(location.origin);
    expect(opts.ignoreErrors).toContain('Non-Error exception captured');
  });

  it('uses environment values and config overrides', () => {
    const env = { tier: 'production', tag: 'v1.2.3', sentry: { dsn: 'env-dsn', enabled: true, debug: true } } as any;
    sentryInitBootstrapHook(env)(makeConfig({ 'sentry.tracesSampleRate': 0.5 }));
    const opts = (Sentry.init as Mock).mock.calls[0][0];
    expect(console.warn).not.toHaveBeenCalled();
    expect(opts.dsn).toBe('env-dsn');
    expect(opts.enabled).toBe(true);
    expect(opts.debug).toBe(true);
    expect(opts.release).toBe('1.2.3');
    expect(opts.environment).toBe('production');
    expect(opts.tracesSampleRate).toBe(0.5);
  });

  it('adds replay and feedback integrations when configured', () => {
    sentryInitBootstrapHook({ tier: 'local' } as any)(
      makeConfig({
        'sentry.dsn': 'x',
        'sentry.integrations.replay': { maskAllText: true },
        'sentry.integrations.feedback': { colorScheme: 'dark' },
      }),
    );
    const opts = (Sentry.init as Mock).mock.calls[0][0];
    expect(opts.integrations).toHaveLength(9);
    expect(Sentry.replayIntegration).toHaveBeenCalledWith({ maskAllText: true });
    expect(Sentry.feedbackIntegration).toHaveBeenCalledWith({ colorScheme: 'dark' });
  });

  it('applies the custom options callback', () => {
    const custom = vi.fn((o: any) => ({ ...o, dsn: 'custom' }));
    const config = makeConfig();
    sentryInitBootstrapHook({ tier: 'local' } as any, custom)(config);
    expect(custom).toHaveBeenCalledWith(expect.any(Object), config);
    expect((Sentry.init as Mock).mock.calls[0][0].dsn).toBe('custom');
  });
});
