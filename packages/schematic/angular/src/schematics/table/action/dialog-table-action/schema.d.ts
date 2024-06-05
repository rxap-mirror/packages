import { AngularOptions } from '../../../../lib/angular-options';
import { DialogTableAction } from '../../../../lib/table/action/dialog-table-action';

export interface DialogTableActionOptions extends DialogTableAction, AngularOptions {
  tableName: string;
}
