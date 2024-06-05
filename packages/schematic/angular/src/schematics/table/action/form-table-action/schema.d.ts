import { AngularOptions } from '../../../../lib/angular-options';
import { FormTableAction } from '../../../../lib/table/action/form-table-action';

export interface FormTableActionOptions extends FormTableAction, AngularOptions {
  tableName: string;
}
