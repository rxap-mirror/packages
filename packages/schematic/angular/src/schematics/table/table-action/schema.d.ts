import { TableRowAction } from '../../../lib/table-row-action';
import { AngularOptions } from '../../../lib/angular-options';


export interface TableActionOptions extends TableRowAction, AngularOptions {
  tableName: string;
}
