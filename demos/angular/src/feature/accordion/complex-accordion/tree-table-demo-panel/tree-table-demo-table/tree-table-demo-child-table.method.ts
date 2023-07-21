import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { Node } from '@rxap/data-structure-tree';
import { ITreeTableDemoTable } from './tree-table-demo-table';

@Injectable()
export class TreeTableDemoChildTableMethod implements Method {
  call(node: Node<ITreeTableDemoTable>): ITreeTableDemoTable[] {
    return [];
  }
}
