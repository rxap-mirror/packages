import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { FeatureElement } from './feature.element';
import { SelectableElement } from './selectable.element';
import { ColumnMenuElement } from './column-menu.element';
import { CreateButtonElement } from './create-button.element';
import { NavigateBackElement } from './navigate-back.element';
import { TreeTableElement } from './tree-table.element';
import { ActionsButtons } from './action-buttons/actions-buttons';
import { PaginatorElement } from './paginator.element';
import { SortElement } from './sort.element';
import { ExpandableRowElement } from './expandable-row.element';

export const Features: Array<Constructor<ParsedElement>> = [
  FeatureElement,
  SelectableElement,
  ColumnMenuElement,
  CreateButtonElement,
  NavigateBackElement,
  TreeTableElement,
  PaginatorElement,
  SortElement,
  ExpandableRowElement,
  ...ActionsButtons
];
