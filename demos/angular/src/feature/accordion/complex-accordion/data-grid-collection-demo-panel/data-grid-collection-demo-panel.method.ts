import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { DataGridCollectionDemoPanel } from './data-grid-collection-demo-panel';

@Injectable()
export class DataGridCollectionDemoPanelMethod implements Method {
  call(parameters?: any): DataGridCollectionDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
