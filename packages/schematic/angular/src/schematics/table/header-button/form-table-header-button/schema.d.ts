import { FormComponentControl } from '../../../../lib/form-component-control';
import { TableHeaderButtonOptions } from '../../table-header-button/schema';


export interface FormTableHeaderButtonOptions extends TableHeaderButtonOptions {
  nestModule: string;
  context: string;
  formComponent?: string;
  customComponent: boolean;
  formOptions?: {
    controlList?: Array<FormComponentControl>;
    role?: string;
    window?: boolean;
  };
}
