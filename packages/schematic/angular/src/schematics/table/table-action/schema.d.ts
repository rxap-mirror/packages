import { AngularOptions } from '../../../lib/angular-options';
import { TableAction } from '../../../lib/table/table-action';

export type TableActionOptions = TableAction & AngularOptions & {
  tableName: string;
}
