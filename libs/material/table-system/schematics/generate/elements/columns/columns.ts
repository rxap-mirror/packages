import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { BooleanColumnElement } from './boolean-column.element';
import { DateColumnElement } from './date-column.element';
import { ColumnElement } from './column.element';
import { Filters } from './filters/filters';

export const Columns: Array<Constructor<ParsedElement>> = [
  BooleanColumnElement,
  DateColumnElement,
  ColumnElement,
  ...Filters
];
