import { OperationTableActionOptions } from '../operation-table-action/schema';

export interface NavigationTableActionOptions extends OperationTableActionOptions {
  route?: string;
}
