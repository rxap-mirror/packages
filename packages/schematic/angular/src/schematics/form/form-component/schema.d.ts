import { AccordionIdentifier } from '../../../lib/accordion-identifier';
import { AngularOptions } from '../../../lib/angular-options';
import { FormComponentControl } from '../../../lib/form-component-control';
import { MatFormFieldDefaultOptions } from '../../../lib/mat-form-field-default-options';

export interface FormComponentOptions extends AngularOptions {
  window?: boolean;
  controlList?: Array<FormComponentControl>;
  role?: string;
  matFormFieldDefaultOptions?: MatFormFieldDefaultOptions;
  identifier?: AccordionIdentifier;
}
