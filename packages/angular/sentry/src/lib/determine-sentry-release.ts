import { Environment } from '@rxap/environment';

/**
 * Determines the sentry release based on the build info object.
 *
 * If the tier is local return undefined.
 * If the tier is production return the tag value as release or undefined.
 *
 * @param environment
 */
export function DetermineSentryRelease(environment: Environment): string | undefined {
  switch (environment['tier']) {
    case 'local':
      return undefined;
    case 'production':
      return environment.tag ?? undefined;
    default:
      return undefined;
  }
}
