import { ConfigService } from '@nestjs/config';
import { SentryModuleOptions } from '@rxap/nest-sentry';
import { DetermineEnvironment } from './determine-environment';
import { DetermineRelease } from './determine-release';
import { Environment } from './environment';

export function SentryOptionsFactory(environment: Environment): (config: ConfigService) => SentryModuleOptions {
  return (config: ConfigService) => {
    const options: SentryModuleOptions = {
      dsn: config.get('SENTRY_DSN'),
      enabled: config.get('SENTRY_ENABLED', false),
      environment: config.get('SENTRY_ENVIRONMENT', DetermineEnvironment(environment)),
      release: config.get('SENTRY_RELEASE', DetermineRelease(environment)),
      serverName: config.get('SENTRY_SERVER_NAME', environment.name),
      debug: config.get('SENTRY_DEBUG', false),
      tracesSampleRate: config.get('SENTRY_TRACES_SAMPLE_RATE', 1.0),
      profilesSampleRate: config.get('SENTRY_PROFILES_SAMPLE_RATE', 1.0),
      logLevels: config.get('SENTRY_LOG_LEVELS', [ 'warn', 'error' ]),
      maxValueLength: config.get('SENTRY_MAX_VALUE_LENGTH', Number.MAX_SAFE_INTEGER),
      normalizeDepth: config.get('SENTRY_NORMALIZE_DEPTH', 5),
    };
    console.debug('SentryOptions: ', JSON.stringify(options));
    return options;
  };
}
