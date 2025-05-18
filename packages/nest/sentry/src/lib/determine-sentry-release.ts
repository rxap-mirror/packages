import { Environment } from '@rxap/nest-utilities';

/**
 * Determines the sentry release based on the build info object.
 *
 * If the tier is local return undefined.
 * If the tier is production return the tag value as release or undefined.
 *
 * @param environment
 */
export function DetermineSentryRelease(environment: Environment): string | undefined {
  switch (environment.tier) {
    case 'local':
      return undefined;
    case 'development':
    case 'testing':
    case 'staging':
    case 'production':
      if (environment.tag?.match(/^v\d+\.\d+\.\d+/)) {
        // if the tag is a semvar remove the v prefix as sentry does not expect a v as prefix
        return environment.tag.replace(/^v/, '');
      }
      return environment.tag ?? undefined;
    default:
      return undefined;
  }
}
