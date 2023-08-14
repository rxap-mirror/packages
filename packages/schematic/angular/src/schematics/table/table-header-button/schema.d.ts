import { AngularOptions } from '../../../lib/angular-options';
import { TableHeaderButton } from '../../../lib/table-header-button';


export interface TableHeaderButtonOptions extends AngularOptions, TableHeaderButton {
  tableName: string;
}
