import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { ITableDemoTable } from './table-demo-table';
import { TableEvent } from '@rxap/data-source/table';

@Injectable()
export class TableDemoTableMethod implements Method {
  call(event: TableEvent): ITableDemoTable[] {
    return [];
  }
}
