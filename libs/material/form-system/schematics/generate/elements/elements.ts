import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { NodeElement } from './node.element';
import { RowElement } from './row.element';
import { ColumnElement } from './column.element';
import { Controls } from './controls/controls';
import { GroupElement } from './group.element';
import { FormElement } from './form.element';
import { TabGroupElement } from './tab.element';
import { Features } from './features/features';
import { DividerElement } from './divider.element';
import { CardElement } from './card.element';
import { Components } from './component/components';
import { ArrayGroupElement } from './array-group.element';

export const Elements: Array<Constructor<ParsedElement>> = [
  NodeElement,
  RowElement,
  ColumnElement,
  GroupElement,
  FormElement,
  TabGroupElement,
  DividerElement,
  CardElement,
  ArrayGroupElement,
  ...Components,
  ...Controls,
  ...Features
];
