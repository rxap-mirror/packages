import {
  WithChildren,
  WithIdentifier,
} from '@rxap/utilities';
import { Node } from '@rxap/data-structure-tree';

export type RowDataWithNode<T extends WithIdentifier & WithChildren> = T & { __node: Node<T> };
