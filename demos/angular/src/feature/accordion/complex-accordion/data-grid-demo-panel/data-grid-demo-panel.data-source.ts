import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { DataGridDemoPanel } from './data-grid-demo-panel';
import { DataGridDemoPanelMethod } from './data-grid-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('data-grid-demo-panel')
export class DataGridDemoPanelDataSource extends PanelAccordionDataSource<DataGridDemoPanel> {
  protected override readonly method = inject(DataGridDemoPanelMethod);
}
