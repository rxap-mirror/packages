import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceGetControllerOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  operationName?: string,
}

export function CoerceGetOperation(options: CoerceGetControllerOptions) {
  const {
    operationName = 'get',
    isReturnVoid = false
  } = options;

  return CoerceOperation({
    ...options,
    operationName,
    isReturnVoid,
  });

}
