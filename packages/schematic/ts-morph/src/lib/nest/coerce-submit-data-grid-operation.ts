import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceFormSubmitOperation,
  CoerceFormSubmitOperationOptions,
} from './coerce-form-submit-operation';

export interface CoerceSubmitDataGridOperationOptions extends Omit<CoerceFormSubmitOperationOptions, 'operationName'> {
  collection?: boolean;
}

export function CoerceSubmitDataGridOperation(options: Readonly<CoerceSubmitDataGridOperationOptions>) {
  const {
    collection = false,
  } = options;

  console.log(`collection: ${ collection }`);

  return CoerceFormSubmitOperation({
    ...options,
  });
}
