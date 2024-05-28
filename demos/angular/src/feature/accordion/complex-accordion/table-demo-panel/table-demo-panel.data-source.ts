import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { TableDemoPanel } from './table-demo-panel';
import { TableDemoPanelMethod } from './table-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('table-demo-panel')
export class TableDemoPanelDataSource extends PanelAccordionDataSource<TableDemoPanel> {
  protected override readonly method = inject(TableDemoPanelMethod);
}
