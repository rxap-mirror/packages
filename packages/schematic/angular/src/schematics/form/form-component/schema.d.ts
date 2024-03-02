import { AccordionIdentifier } from '../../../lib/accordion-identifier';
import { AngularOptions } from '../../../lib/angular-options';
import { Control } from '../../../lib/form/control';
import { MatFormFieldDefaultOptions } from '../../../lib/mat-form-field-default-options';

export interface FormComponentOptions extends AngularOptions {
  window?: boolean;
  controlList?: Array<Control>;
  role?: string;
  matFormFieldDefaultOptions?: MatFormFieldDefaultOptions;
  identifier?: AccordionIdentifier;
}
