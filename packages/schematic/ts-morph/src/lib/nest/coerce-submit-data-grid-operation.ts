import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceFormSubmitOperation,
  CoerceFormSubmitOperationOptions,
} from './coerce-form-submit-operation';

export interface CoerceSubmitDataGridOperationOptions extends Omit<CoerceFormSubmitOperationOptions, 'operationName'> {
  collection?: boolean;
}

export function CoerceSubmitDataGridOperation(options: Readonly<CoerceSubmitDataGridOperationOptions>) {
  let {
    paramList,
    collection,
    controllerName,
  } = options;
  collection ??= false;
  paramList ??= [];
  controllerName = CoerceSuffix(controllerName, '-data-grid');

  return CoerceFormSubmitOperation({
    ...options,
    controllerName,
    paramList,
  });
}
