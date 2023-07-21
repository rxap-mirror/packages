import { ConfigService } from '@rxap/config';
import { Environment } from '@rxap/environment';
import * as Sentry from '@sentry/angular-ivy';
import { BrowserTracing } from '@sentry/browser';
import { HttpClient as HttpClientIntegration } from '@sentry/integrations';
import { DetermineSentryEnvironment } from './determine-sentry-environment';
import { DetermineSentryRelease } from './determine-sentry-release';

export function SentryInit(environment: Environment) {

  const dsn = ConfigService.Get('sentry.dsn', environment.sentry?.dsn, ConfigService.Config);

  if (!dsn) {
    console.warn('No sentry dsn provided. Sentry will not be initialized.');
  }

  Sentry.init({
    dsn: environment.sentry?.dsn,
    enabled: ConfigService.Get('sentry.enabled', environment.sentry?.enabled ?? false, ConfigService.Config),
    debug: ConfigService.Get('sentry.debug', environment.sentry?.debug ?? false, ConfigService.Config),
    environment: DetermineSentryEnvironment(environment),
    release: DetermineSentryRelease(environment),
    tunnel: ConfigService.Get('sentry.tunnel', environment.production ? '/tunnel' : undefined, ConfigService.Config),
    initialScope: {
      user: { ip_address: '{{auto}}' },
      tags: {
        origin: location.origin,
        host: location.host,
      },
    },
    replaysSessionSampleRate: ConfigService.Get('sentry.replaysSessionSampleRate', 1.0, ConfigService.Config),
    replaysOnErrorSampleRate: ConfigService.Get('sentry.replaysOnErrorSampleRate', 1.0, ConfigService.Config),
    autoSessionTracking: ConfigService.Get('sentry.autoSessionTracking', true, ConfigService.Config),
    maxValueLength: ConfigService.Get('sentry.maxValueLength', Number.MAX_SAFE_INTEGER, ConfigService.Config),
    integrations: [
      new HttpClientIntegration({
        failedRequestTargets: environment.sentry?.integrations?.httpClient?.failedRequestTargets,
      }),
      new BrowserTracing({
        routingInstrumentation: Sentry.routingInstrumentation,
        tracePropagationTargets: environment.sentry?.integrations?.BrowserTracing?.tracePropagationTargets,
      }),
      new Sentry.Replay({
        // Additional SDK configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],
    tracesSampleRate: ConfigService.Get('sentry.tracesSampleRate', 1.0, ConfigService.Config),
    ignoreErrors: [
      'Non-Error exception captured',
    ],
  });
}
