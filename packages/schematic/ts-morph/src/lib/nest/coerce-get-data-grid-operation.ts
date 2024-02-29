import {
  CoerceGetByIdControllerOptions,
  CoerceGetByIdOperation,
} from './coerce-get-by-id-operation';

export interface CoerceGetDataGridOperationOptions extends CoerceGetByIdControllerOptions {
  /**
   * @deprecated use isArray instead
   */
  collection?: boolean;
}

export function CoerceGetDataGridOperation(options: Readonly<CoerceGetDataGridOperationOptions>) {
  const {
    collection= false,
    isArray = collection ?? false,
    // if not explicitly defined the idProperty is set to null, as not each data grid operation has an id
    idProperty = null,
    operationName = idProperty ? 'getById' : 'get',
  } = options;

  return CoerceGetByIdOperation({
    ...options,
    operationName,
    idProperty,
    isArray,
  });

}
