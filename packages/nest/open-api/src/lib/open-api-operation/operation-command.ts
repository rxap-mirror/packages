import { OPERATION_COMMAND_META_DATA_KEY } from './tokens';
import { OperationCommandOptions } from '../types';

export function OperationCommand(operation: OperationCommandOptions) {
  return function (target: any) {
    Reflect.defineMetadata(OPERATION_COMMAND_META_DATA_KEY, operation, target);
  };
}
