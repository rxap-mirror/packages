import { AngularOptions } from '../../../lib/angular-options';
import { HeaderButton } from '../../../lib/table/table-header-button';


export type TableHeaderButtonOptions = AngularOptions & HeaderButton & {
  tableName: string;
}
