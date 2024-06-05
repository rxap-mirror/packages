import { AngularOptions } from '../../../../lib/angular-options';
import { OperationTableAction } from '../../../../lib/table/action/operation-table-action';

export interface OperationTableActionOptions extends OperationTableAction, AngularOptions {
  tableName: string;
}
