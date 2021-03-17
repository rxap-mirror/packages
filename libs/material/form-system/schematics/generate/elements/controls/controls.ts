import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ControlElement } from './control.element';
import { CheckboxControlElement } from './checkbox-control.element';
import { ComponentControlElement } from './component-control.element';
import { PasswordControlElement } from './password-control.element';
import { Features } from './features/features';
import { FormFields } from './form-field/form-fields';
import { TableSelectControlElement } from './table-select-control.element';

export const Controls: Array<Constructor<ParsedElement>> = [
  ControlElement,
  CheckboxControlElement,
  ComponentControlElement,
  PasswordControlElement,
  TableSelectControlElement,
  ...Features,
  ...FormFields
];
