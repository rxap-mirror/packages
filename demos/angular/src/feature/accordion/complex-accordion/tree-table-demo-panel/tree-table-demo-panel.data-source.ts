import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject, inject } from '@angular/core';
import { TreeTableDemoPanel } from './tree-table-demo-panel';
import { TreeTableDemoPanelMethod } from './tree-table-demo-panel.method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('tree-table-demo-panel')
export class TreeTableDemoPanelDataSource extends PanelAccordionDataSource<TreeTableDemoPanel> {
  protected override readonly method = inject(TreeTableDemoPanelMethod);
}
