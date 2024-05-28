import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { TableDemoPanel } from './table-demo-panel';

@Injectable()
export class TableDemoPanelMethod implements Method {
  call(parameters?: any): TableDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
