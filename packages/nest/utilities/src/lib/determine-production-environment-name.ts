import {Environment} from './environment';

export function DetermineProductionEnvironmentName(environment: Environment) {
  if (environment.tag) {
    const tagMatch = environment.tag.match(/^v\d+\.\d+\.\d+(-([^.]+)\.\d+)?$/);
    if (!tagMatch) {
      return undefined;
    }
    // if the tage has a chanel/digest use this as environment name
    return tagMatch[2] ?? 'production';
  } else if (environment.branch) {
    return environment.branch;
  }
  return undefined;
}
