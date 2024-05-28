import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { TreeTableDemoPanel } from './tree-table-demo-panel';

@Injectable()
export class TreeTableDemoPanelMethod implements Method {
  call(parameters?: any): TreeTableDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
