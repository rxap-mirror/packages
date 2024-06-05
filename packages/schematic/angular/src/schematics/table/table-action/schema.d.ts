import { AngularOptions } from '../../../lib/angular-options';
import { TableAction } from '../../../lib/table/table-action';


export interface TableActionOptions extends TableAction, AngularOptions {
  tableName: string;
}
