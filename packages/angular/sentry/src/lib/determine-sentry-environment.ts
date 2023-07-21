import {
  DetermineProductionEnvironmentName,
  Environment,
} from '@rxap/environment';

/**
 * Determines the sentry environment based on the build info object.
 *
 * If the tier is local return undefined.
 * If the tier is production determine the environment based on the tag and branch name.
 *
 * @param environment
 */
export function DetermineSentryEnvironment(environment: Environment): string | undefined {
  switch (environment['tier']) {
    case 'local':
      return undefined;
    case 'production':
      return DetermineProductionEnvironmentName(environment);
    default:
      return undefined;
  }
}
