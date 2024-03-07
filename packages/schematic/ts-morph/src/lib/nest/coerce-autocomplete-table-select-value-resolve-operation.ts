import { NormalizedDataProperty } from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { BuildTableSelectValueResolveUpstreamGetParametersImplementation } from './coerce-table-select-value-resolve-operation';

export interface CoerceAutocompleteTableSelectValueResolveOperationOptions
  extends CoerceOperationOptions {
  rowDisplayProperty: NormalizedDataProperty;
  rowValueProperty: NormalizedDataProperty;
}

export function CoerceAutocompleteTableSelectValueResolveOperationRule(options: CoerceAutocompleteTableSelectValueResolveOperationOptions) {
  const {
    buildUpstreamGetParametersImplementation = BuildTableSelectValueResolveUpstreamGetParametersImplementation,
    propertyList = [],
    rowDisplayProperty,
    rowValueProperty ,
  } = options;

  CoerceArrayItems(propertyList, [
    {
      ...rowValueProperty,
      name: 'value',
      source: rowValueProperty.name,
    },
    {
      ...rowDisplayProperty,
      name: 'display',
      source: rowDisplayProperty.name,
    },
  ], { compareTo: (a, b) => a.name === b.name, unshift: true });

  return CoerceOperation<CoerceAutocompleteTableSelectValueResolveOperationOptions>({
    ...options,
    buildUpstreamGetParametersImplementation,
  });
}
