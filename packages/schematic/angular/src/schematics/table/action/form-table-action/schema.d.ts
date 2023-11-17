import { LoadFromTableActionOptions } from '@rxap/schematics-ts-morph';
import { OperationTableActionOptions } from '../operation-table-action/schema';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormTableActionOptions extends OperationTableActionOptions {
  loadFrom?: LoadFromTableActionOptions;
  formInitial?: Record<string, any>;
  formComponent?: string;
}
