import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ControlElement } from './control.element';
import { InputControlElement } from './input-control.element';
import { SelectControlElement } from './select-control.element';
import { CheckboxControlElement } from './checkbox-control.element';
import { ComponentControlElement } from './component-control.element';
import { PasswordControlElement } from './password-control.element';
import { TextareaControlElement } from './textarea-control.element';

export const Controls: Array<Constructor<ParsedElement>> = [
  ControlElement,
  InputControlElement,
  SelectControlElement,
  CheckboxControlElement,
  ComponentControlElement,
  PasswordControlElement,
  TextareaControlElement
];
