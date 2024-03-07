import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  TypeImport,
  TypeName,
} from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceDtoClass,
  CoerceDtoClassOptions,
} from './coerce-dto-class';

export interface CoerceRowDtoClassOptions extends CoerceDtoClassOptions {
  /**
   * the type of the property used as row id type. defaults to the type 'string'. If null the type will be
   * set to number
   */
  rowIdType?: TypeImport | TypeName;
}

export function BuildRowDtoClassName(name: string): string {
  return CoerceSuffix(name, '-row');
}

export function CoerceRowDtoClass(options: CoerceRowDtoClassOptions) {
  const {
    rowIdType = 'number',
    project,
    name,
    propertyList = [],
  } = options;
  CoerceArrayItems(propertyList, [{
    name: '__rowId',
    type: rowIdType,
  }], (a, b) => a.name === b.name);
  return CoerceDtoClass({
    project,
    name: BuildRowDtoClassName(name),
    propertyList,
  });
}
