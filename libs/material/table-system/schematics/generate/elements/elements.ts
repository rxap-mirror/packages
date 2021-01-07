import { FilterElement } from './columns/filters/filter.element';
import { TableElement } from './table.element';
import { Features } from './features/features';
import { Columns } from './columns/columns';
import { Methods } from '@rxap/schematics-utilities';

export const TableSystemElements = [
  FilterElement,
  TableElement,
  ...Features,
  ...Columns,
  ...Methods
];
