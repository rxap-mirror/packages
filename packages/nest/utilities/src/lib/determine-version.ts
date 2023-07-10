import { Environment } from './environment';

export function DetermineVersion(environment: Environment): string {

  if (environment.tag) {
    return environment.tag;
  } else if (environment.branch) {
    return environment.branch;
  }
  return 'local-development';

}
