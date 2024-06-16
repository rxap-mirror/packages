import { AngularOptions } from '../../../../lib/angular-options';
import { FormHeaderButton } from '../../../../lib/table/header-button/form-header-button';

export type FormTableHeaderButtonOptions = AngularOptions & FormHeaderButton & {
  tableName: string;
  formComponent?: string;
  customComponent: boolean;
}
