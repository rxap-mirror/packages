import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { DataGridDemoPanel } from './data-grid-demo-panel';

@Injectable()
export class DataGridDemoPanelMethod implements Method {
  call(parameters?: any): DataGridDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
