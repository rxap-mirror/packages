import { Environment } from '@rxap/nest-utilities';
import * as Sentry from "@sentry/nestjs";
import { DetermineSentryEnvironment } from './determine-sentry-environment';
import { DetermineSentryRelease } from './determine-sentry-release';
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function sentryInitHook() {
  return (_: any, environment: Environment) => {

    const dsn = process.env['SENTRY_DSN'] ?? environment.sentry?.dsn;

    if (!dsn) {
      console.warn('No sentry dsn provided.');
    }

    Sentry.init({
      dsn,
      enabled: process.env['SENTRY_ENABLED'] === 'true' || (environment.sentry?.enabled ?? false),
      debug: process.env['SENTRY_DEBUG'] === 'true' || (environment.sentry?.debug ?? false),
      environment: DetermineSentryEnvironment(environment),
      release: DetermineSentryRelease(environment),
      integrations: [
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn'],
        }),
        nodeProfilingIntegration(),
        Sentry.anrIntegration({ captureStackTrace: true }),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  };
}
