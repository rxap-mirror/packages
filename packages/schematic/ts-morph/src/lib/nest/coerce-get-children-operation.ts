import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceGetRootOperation,
  CoerceGetRootOperationOptions,
} from './coerce-get-root-operation';

export type CoerceGetChildrenOperationOptions = CoerceGetRootOperationOptions

export function CoerceGetChildrenOperation(options: Readonly<CoerceGetChildrenOperationOptions>) {
  const {
    paramList = [],
    operationName = 'get-children',
  } = options;
  CoerceArrayItems(paramList, [
    {
    name: 'parentUuid',
    type: 'string',
    }
  ], (a, b) => a.name === b.name);
  return CoerceGetRootOperation({
    ...options,
    operationName,
    paramList,
  });
}
