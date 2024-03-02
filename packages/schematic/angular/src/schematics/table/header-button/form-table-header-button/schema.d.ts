import { Control } from '../../../../lib/form/control';
import { TableHeaderButtonOptions } from '../../table-header-button/schema';


export interface FormTableHeaderButtonOptions extends TableHeaderButtonOptions {
  nestModule: string;
  context: string;
  formComponent?: string;
  customComponent: boolean;
  formOptions?: {
    controlList?: Array<Control>;
    role?: string;
    window?: boolean;
  };
}
