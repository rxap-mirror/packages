import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { Features } from './features/features';
import { ArrayElement } from './array.element';
import { ComponentArrayElement } from './component-array.element';

export const Arrays: Array<Constructor<ParsedElement>> = [
  ArrayElement,
  ComponentArrayElement,
  ...Features
];
