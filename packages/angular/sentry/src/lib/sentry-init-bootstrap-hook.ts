import { ConfigService } from '@rxap/config';
import { Environment } from '@rxap/environment';
import type { BrowserOptions } from '@sentry/browser';
import {
  DetermineSentryRelease
} from './determine-sentry-release';
import * as Sentry from '@sentry/angular';
import { DetermineSentryEnvironment } from './determine-sentry-environment';
import type { DataCollection, Integration } from '@sentry/core';

export function sentryInitBootstrapHook(environment: Environment, custom: (options: BrowserOptions, config: ConfigService) => BrowserOptions = options => options) {
  return (config: ConfigService) => {

    const dsn = config.get('sentry.dsn', environment.sentry?.dsn);

    if (!dsn) {
      console.warn('No sentry dsn provided.');
    }

    const integrations: Integration[] = [
      Sentry.browserTracingIntegration(config.get('sentry.integrations.browserTracing')),
      Sentry.browserProfilingIntegration(),
      Sentry.browserSessionIntegration(),
      Sentry.captureConsoleIntegration(config.get('sentry.integrations.captureConsole', {
        levels: ['error'],
      })),
      Sentry.extraErrorDataIntegration(config.get('sentry.integrations.extraErrorData')),
      Sentry.httpClientIntegration(config.get('sentry.integrations.httpClient')),
      Sentry.reportingObserverIntegration(config.get('sentry.integrations.reportingObserver')),
    ];

    if (config.get('sentry.integrations.replay')) {
      /**
       * {
       *  // Additional SDK configuration goes in here, for example:
       *  maskAllText: true,
       *  blockAllMedia: true,
       *  maskAllInputs: true,
       *  networkDetailAllowUrls: [`${location.origin}/api/`]
       * }
       */
      integrations.push(Sentry.replayIntegration(config.get('sentry.integrations.replay')));
    }

    if (config.get('sentry.integrations.feedback')) {
      integrations.push(Sentry.feedbackIntegration(config.get('sentry.integrations.feedback')));
    }

    Sentry.init(custom({
      dsn,
      enabled: config.get('sentry.enabled', environment.sentry?.enabled ?? false),
      debug: config.get('sentry.debug', environment.sentry?.debug ?? false),
      environment: config.get('environment', DetermineSentryEnvironment(environment)),
      release: DetermineSentryRelease(environment),
      transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
      integrations,
      tracesSampleRate: config.get('sentry.tracesSampleRate', 1.0),
      // Sentry v11 replaced `profilesSampleRate` with the session based `profileSessionSampleRate`.
      // The legacy config key `sentry.profilesSampleRate` is still honored as a fallback.
      profileSessionSampleRate: config.get('sentry.profileSessionSampleRate', config.get('sentry.profilesSampleRate', 1.0)),
      profileLifecycle: config.get('sentry.profileLifecycle', 'trace'),
      tracePropagationTargets: ["localhost", new RegExp(`${location.origin}/api/`)],
      replaysSessionSampleRate: config.get('sentry.replaysSessionSampleRate', 0.0),
      replaysOnErrorSampleRate: config.get('sentry.replaysOnErrorSampleRate', 1.0),
      maxValueLength: config.get('sentry.maxValueLength', Number.MAX_SAFE_INTEGER),
      // Sentry v11 removed `sendDefaultPii` in favor of `dataCollection`. The defaults of `dataCollection`
      // collect everything, which matches the former default `sendDefaultPii: true`. The legacy config key
      // `sentry.sendDefaultPii: false` is mapped to the equivalent restrictive `dataCollection` settings.
      dataCollection: config.get<DataCollection>(
        'sentry.dataCollection',
        config.get('sentry.sendDefaultPii', true) ? {} : { userInfo: false, cookies: false, httpHeaders: false },
      ),

      initialScope: {
        user: { ip_address: '{{auto}}' },
        tags: {
          origin: location.origin,
          host: location.host,
        },
      },

      ignoreErrors: [
        'Non-Error exception captured',
      ],
    }, config));

  };
}
