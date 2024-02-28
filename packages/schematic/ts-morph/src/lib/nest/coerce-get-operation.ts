import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceGetControllerOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  operationName?: string,
}

export function CoerceGetOperation<Options = Record<string, any>>(options: CoerceGetControllerOptions) {
  const {
    operationName = 'get',
    isReturnVoid = false
  } = options;

  return CoerceOperation<Options>({
    ...options,
    operationName,
    isReturnVoid,
  });

}
