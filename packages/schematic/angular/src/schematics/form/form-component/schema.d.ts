import { FormComponentControl } from '../../../lib/form-component-control';
import { AngularOptions } from '../../../lib/angular-options';

export interface FormComponentOptions extends AngularOptions {
  window?: boolean;
  controlList?: Array<string | FormComponentControl>;
  role?: string;
}
