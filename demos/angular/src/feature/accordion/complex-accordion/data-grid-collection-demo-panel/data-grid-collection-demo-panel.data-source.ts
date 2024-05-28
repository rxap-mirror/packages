import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { DataGridCollectionDemoPanel } from './data-grid-collection-demo-panel';
import { DataGridCollectionDemoPanelMethod } from './data-grid-collection-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('data-grid-collection-demo-panel')
export class DataGridCollectionDemoPanelDataSource extends PanelAccordionDataSource<DataGridCollectionDemoPanel> {
  protected override readonly method = inject(
    DataGridCollectionDemoPanelMethod
  );
}
