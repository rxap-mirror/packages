import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { FilterElement } from './filter.element';

export const Filters: Array<Constructor<ParsedElement>> = [
  FilterElement
];
