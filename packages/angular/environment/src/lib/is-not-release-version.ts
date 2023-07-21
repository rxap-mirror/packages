import { Environment } from './environment';

export function IsNotReleaseVersion(environment: Environment): boolean {
  if (!environment.tag) {
    return true;
  }
  if (environment.tier !== 'production') {
    return true;
  }
  const tagMatch = environment.tag.match(/^v\d+\.\d+\.\d+(-([^.]+)\.\d+)?$/);
  if (!tagMatch) {
    return true;
  }
  if (tagMatch[2]) {
    return true;
  }
  return false;
}
