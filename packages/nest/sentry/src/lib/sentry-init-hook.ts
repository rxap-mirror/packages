import { Environment } from '@rxap/nest-utilities';
import * as Sentry from '@sentry/nestjs';
import { NodeClient } from '@sentry/node';
import type { NodeOptions } from '@sentry/node/build/types/types';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { DetermineSentryEnvironment } from './determine-sentry-environment';
import { DetermineSentryRelease } from './determine-sentry-release';

export function sentryInitHook<AppOptions = any>(
  options: Partial<NodeOptions> = {},
  callback?: (client: NodeClient | undefined, options: AppOptions, environment: Environment) => void
) {
  return (appOptions: any, environment: Environment) => {
    const dsn = process.env['SENTRY_DSN'] ?? environment.sentry?.dsn;

    if (!dsn) {
      console.warn('No sentry dsn provided.');
    }

    const client = Sentry.init({
      dsn,
      enabled:
        process.env['SENTRY_ENABLED'] === 'true' ||
        (environment.sentry?.enabled ?? false),
      debug:
        process.env['SENTRY_DEBUG'] === 'true' ||
        (environment.sentry?.debug ?? false),
      environment: process.env['ENVIRONMENT'] ?? DetermineSentryEnvironment(environment),
      release: DetermineSentryRelease(environment),
      integrations: [
        Sentry.captureConsoleIntegration({
          levels: ['error'],
        }),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profileSessionSampleRate: 1.0,
      profileLifecycle: 'trace',
      enableLogs: true,
      ...options,
    });

    if (callback) {
      callback(client, appOptions, environment);
    }

  };
}
