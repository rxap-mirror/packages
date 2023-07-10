import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceFormSubmitOperation,
  CoerceFormSubmitOperationOptions,
} from './coerce-form-submit-operation';
import { SchematicsException } from '@angular-devkit/schematics';

export interface CoerceSubmitDataGridOperationOptions extends Omit<CoerceFormSubmitOperationOptions, 'operationName'> {
  collection?: boolean;
}

export function CoerceSubmitDataGridOperation(options: Readonly<CoerceSubmitDataGridOperationOptions>) {
  let {
    paramList,
    collection,
    controllerName,
    nestController,
    name,
  } = options;
  collection ??= false;
  paramList ??= [];
  controllerName ??= nestController;
  controllerName ??= name;

  if (!controllerName) {
    throw new SchematicsException('No controller name provided!');
  }

  controllerName = CoerceSuffix(controllerName, '-data-grid');

  return CoerceFormSubmitOperation({
    ...options,
    // TODO : remove after migration to controllerName
    name: controllerName,
    nestController: controllerName,
    controllerName,
    paramList,
  });
}
