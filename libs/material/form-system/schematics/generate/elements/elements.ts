import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { NodeElement } from './node.element';
import { RowElement } from './row.element';
import { ColumnElement } from './column.element';
import { Controls } from './controls/controls';
import { GroupElement } from './group.element';
import { FormElement } from './form.element';
import { TabGroup } from './tab.element';

export const Elements: Array<Constructor<ParsedElement>> = [
  NodeElement,
  RowElement,
  ColumnElement,
  GroupElement,
  FormElement,
  TabGroup,
  ...Controls
];
