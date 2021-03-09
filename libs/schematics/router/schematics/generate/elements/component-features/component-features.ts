import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { FormComponentFeatureElement } from './form-component-feature.element';
import { FormDefinitionFeatureElement } from './form-definition-feature.element';
import { TableComponentFeatureElement } from './table-component-feature.element';

export const ComponentFeatures: Array<Constructor<ParsedElement>> = [
  FormComponentFeatureElement,
  FormDefinitionFeatureElement,
  TableComponentFeatureElement,
];
