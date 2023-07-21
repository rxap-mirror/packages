import { DialogAction } from '../../../dialog-component/schema';
import { OperationTableActionOptions } from '../operation-table-action/schema';

export interface DialogTableActionOptions extends OperationTableActionOptions {
  withoutBody?: boolean;
  actionList?: Array<string | DialogAction>;
  title?: string;
}
