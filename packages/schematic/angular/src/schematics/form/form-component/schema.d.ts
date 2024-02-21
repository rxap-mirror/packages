import { FormComponentControl } from '../../../lib/form-component-control';
import { AngularOptions } from '../../../lib/angular-options';
import { MatFormFieldDefaultOptions } from '../../../lib/mat-form-field-default-options';

export interface FormComponentOptions extends AngularOptions {
  window?: boolean;
  controlList?: Array<FormComponentControl>;
  role?: string;
  matFormFieldDefaultOptions?: MatFormFieldDefaultOptions;
}
