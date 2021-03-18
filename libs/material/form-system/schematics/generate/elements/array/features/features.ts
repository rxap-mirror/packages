import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ArrayFeatureElement } from './array-feature.element';
import { PermissionsElement } from './permissions.element';

export const Features: Array<Constructor<ParsedElement>> = [
  ArrayFeatureElement,
  PermissionsElement
];
