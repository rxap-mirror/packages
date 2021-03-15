import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { BooleanColumnElement } from './boolean-column.element';
import { DateColumnElement } from './date-column.element';
import { ColumnElement } from './column.element';
import { Filters } from './filters/filters';
import { LinkColumnElement } from './link-column.element';
import { OptionsColumnElement } from './options-column.element';

export const Columns: Array<Constructor<ParsedElement>> = [
  BooleanColumnElement,
  DateColumnElement,
  ColumnElement,
  LinkColumnElement,
  OptionsColumnElement,
  ...Filters
];
