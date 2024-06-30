import { OperationCommandOptions } from '../types';
import { OPERATION_COMMAND_META_DATA_KEY } from './tokens';

export function OperationCommand(operation: OperationCommandOptions) {
  return function (target: any) {
    Reflect.defineMetadata(OPERATION_COMMAND_META_DATA_KEY, operation, target);
  };
}
