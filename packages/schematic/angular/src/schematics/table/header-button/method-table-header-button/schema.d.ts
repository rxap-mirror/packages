import { AngularOptions } from '../../../../lib/angular-options';
import { MethodHeaderButton } from '../../../../lib/table/header-button/method-header-button';

export type MethodTableHeaderButtonOptions = AngularOptions & MethodHeaderButton & {
  tableName: string;
}
