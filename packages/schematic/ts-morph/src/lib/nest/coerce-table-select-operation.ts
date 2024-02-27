import { NormalizeTypeImport } from '@rxap/ts-morph';
import {
  CoerceGetPageOperation,
  CoerceGetPageOperationOptions,
} from './coerce-get-page-operation';

export interface CoerceTableSelectOperationOptions extends CoerceGetPageOperationOptions {
  rowDisplayProperty?: string;
  rowValueProperty?: string;
}

export function CoerceTableSelectOperationRule(options: CoerceTableSelectOperationOptions) {
  const {
    propertyList = [],
    rowIdProperty= 'uuid',
    rowDisplayProperty = 'name',
    rowValueProperty = rowIdProperty ?? 'uuid',
  } = options;

  propertyList.unshift({
    name: '__display',
    type: NormalizeTypeImport('string'),
    isArray: false,
    source: rowDisplayProperty,
  });
  propertyList.unshift({
    name: '__value',
    type: NormalizeTypeImport('string'),
    isArray: false,
    source: rowValueProperty,
  });

  return CoerceGetPageOperation({
    ...options,
    propertyList: propertyList,
    rowIdProperty,
  });

}
