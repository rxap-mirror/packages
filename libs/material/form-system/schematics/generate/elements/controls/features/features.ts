import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ControlFeatureElement } from './control-feature.element';
import { ClearElement } from './clear.element';
import { HideElement } from './hide.element';

export const Features: Array<Constructor<ParsedElement>> = [
  ControlFeatureElement,
  ClearElement,
  HideElement
];
