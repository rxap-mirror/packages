import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { EditDataGridCollectionDemoPanel } from './edit-data-grid-collection-demo-panel';

@Injectable()
export class EditDataGridCollectionDemoPanelMethod implements Method {
  call(parameters?: any): EditDataGridCollectionDemoPanel {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
