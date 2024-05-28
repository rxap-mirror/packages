import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { EditDataGridCollectionDemoPanel } from './edit-data-grid-collection-demo-panel';
import { EditDataGridCollectionDemoPanelMethod } from './edit-data-grid-collection-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('edit-data-grid-collection-demo-panel')
export class EditDataGridCollectionDemoPanelDataSource extends PanelAccordionDataSource<EditDataGridCollectionDemoPanel> {
  protected override readonly method = inject(
    EditDataGridCollectionDemoPanelMethod
  );
}
