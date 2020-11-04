import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { FeatureElement } from './feature.element';

export const FeatureElements: Array<Constructor<ParsedElement>> = [
  FeatureElement
];
