import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceDtoClass,
  CoerceDtoClassOptions,
} from './coerce-dto-class';

export interface CoerceRowDtoClassOptions extends CoerceDtoClassOptions {
  /**
   * the type of the property used as row id type. defaults to the type 'string'. If null the type will be
   * set to number
   */
  rowIdType?: string | null;
}

export function CoerceRowDtoClass(options: CoerceRowDtoClassOptions) {
  let {
    rowIdType,
    project,
    name,
    propertyList,
    classStructure,
    importStructureList,
  } = options;
  propertyList ??= [];
  propertyList.unshift(
    {
      name: '__rowId',
      type: rowIdType === null ? 'number' : rowIdType ?? 'string',
    },
  );
  return CoerceDtoClass({
    project,
    name: CoerceSuffix(name, '-row'),
    propertyList,
    classStructure,
    importStructureList,
  });
}
