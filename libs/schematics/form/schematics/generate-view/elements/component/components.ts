import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ComponentElement } from './component.element';
import { ComponentFeatures } from './features/features';

export const Components: Array<Constructor<ParsedElement>> = [
  ComponentElement,
  ...ComponentFeatures
];
