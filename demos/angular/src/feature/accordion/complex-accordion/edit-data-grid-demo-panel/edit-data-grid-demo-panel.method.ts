import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { EditDataGridDemoPanel } from './edit-data-grid-demo-panel';

@Injectable()
export class EditDataGridDemoPanelMethod implements Method {
  call(parameters?: any): EditDataGridDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
