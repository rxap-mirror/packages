import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceTreeOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  operationName?: string;
  fullTree?: boolean;
}

export function CoerceTreeOperationRule(options: CoerceTreeOperationOptions) {
  const {
    operationName = 'tree',
    fullTree= false,
    path= 'true',
    propertyList = [],
    dtoClassNameSuffix = '-tree-node',
    isArray = true,
  } = options;

  CoerceArrayItems(propertyList, [
    {
      name: 'id',
      type: 'string',
    },
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'icon',
      type: {
        name: 'IconDto',
        moduleSpecifier: '@rxap/nest-dto'
      },
      isType: true,
    },
    {
      name: 'children',
      isOptional: true,
      isArray: true,
      isType: true,
      type: '<self>',
    },
  ], (a, b) => a.name === b.name);

  if (!fullTree) {
    throw new Error('non full tree not implemented yet');
  }

  return CoerceOperation({
    ...options,
    path,
    operationName,
    dtoClassNameSuffix,
    propertyList,
    isArray,
  });
}
