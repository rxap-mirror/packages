import { AngularOptions } from '../../../lib/angular-options';
import { TableHeaderButton } from '../../../lib/table-header-button';


export interface TableHeaderButtonOptions<Options extends Record<string, any> = Record<string, any>>
  extends AngularOptions, TableHeaderButton<Options> {
  tableName: string;
}
