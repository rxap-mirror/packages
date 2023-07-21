import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { ITreeTableDemoTable } from './tree-table-demo-table';

@Injectable()
export class TreeTableDemoRootTableMethod implements Method {
  call(): ITreeTableDemoTable[] {
    return [];
  }
}
