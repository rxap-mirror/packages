import { dasherize } from '@rxap/schematics-utilities';

export function buildOptionsOperationPath({ name }: { name: string }) {
  return [ 'control', dasherize(name), 'table-select', 'page' ].join('/');
}