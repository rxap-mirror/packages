import { AngularOptions } from '../../../../lib/angular-options';
import { NavigationTableAction } from '../../../../lib/table/action/navigation-table-action';

export interface NavigationTableActionOptions extends NavigationTableAction, AngularOptions {
  tableName: string;
}
