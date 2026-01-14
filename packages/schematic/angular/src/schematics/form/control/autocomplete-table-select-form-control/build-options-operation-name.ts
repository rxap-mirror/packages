import { dasherize } from '@rxap/schematics-utilities';

export function buildOptionsOperationName({ name }: { name: string }) {
  return [ 'get', dasherize(name), 'control', 'table-select', 'page' ].join('-');
}