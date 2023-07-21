import {
  capitalize,
  dasherize,
} from '@rxap/schematics-utilities';

export function ToTitle(str: string) {
  return dasherize(str)
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}
