import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { InputControlElement } from './input-control.element';
import { SelectControlElement } from './select-control.element';
import { TextareaControlElement } from './textarea-control.element';

export const FormFields: Array<Constructor<ParsedElement>> = [
  InputControlElement,
  SelectControlElement,
  TextareaControlElement
];
