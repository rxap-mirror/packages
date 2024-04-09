import { Environment } from './environment';

export function DetermineReleaseName(environment: Environment, defaultReleaseName = 'local-development'): string {

  if (environment.tag) {
    return environment.tag;
  } else if (environment.branch) {
    return environment.branch;
  }
  return defaultReleaseName;

}
