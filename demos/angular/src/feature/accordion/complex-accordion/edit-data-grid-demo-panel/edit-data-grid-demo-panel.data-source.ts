import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { EditDataGridDemoPanel } from './edit-data-grid-demo-panel';
import { EditDataGridDemoPanelMethod } from './edit-data-grid-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('edit-data-grid-demo-panel')
export class EditDataGridDemoPanelDataSource extends PanelAccordionDataSource<EditDataGridDemoPanel> {
  protected override readonly method = inject(EditDataGridDemoPanelMethod);
}
