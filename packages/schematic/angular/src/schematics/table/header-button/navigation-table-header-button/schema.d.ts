import { AngularOptions } from '../../../../lib/angular-options';
import { NavigationHeaderButton } from '../../../../lib/table/header-button/navigation-header-button';


export type NavigationTableHeaderButtonOptions = AngularOptions & NavigationHeaderButton & {
  tableName: string;
}
