import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ComplexAccordionDataSource } from './complex-accordion.data-source';
import { ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { CommonModule } from '@angular/common';

import { DataGridDemoPanelComponent } from './data-grid-demo-panel/data-grid-demo-panel.component';

import { DataGridCollectionDemoPanelComponent } from './data-grid-collection-demo-panel/data-grid-collection-demo-panel.component';

import { EditDataGridDemoPanelComponent } from './edit-data-grid-demo-panel/edit-data-grid-demo-panel.component';

import { EditDataGridCollectionDemoPanelComponent } from './edit-data-grid-collection-demo-panel/edit-data-grid-collection-demo-panel.component';

import { TableDemoPanelComponent } from './table-demo-panel/table-demo-panel.component';

import { TreeTableDemoPanelComponent } from './tree-table-demo-panel/tree-table-demo-panel.component';

import { DataSourceDirective } from '@rxap/data-source/directive';
import { NavigateBackButtonComponent } from '@rxap/components';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { PersistentAccordionDirective } from '@rxap/material-directives/expansion';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';
import { ComplexAccordionMethod } from './complex-accordion.method';

@Component({
  selector: 'rxap-complex-accordion',
  templateUrl: './complex-accordion.component.html',
  styleUrls: [ './complex-accordion.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [

    DataGridDemoPanelComponent,

    DataGridCollectionDemoPanelComponent,

    EditDataGridDemoPanelComponent,

    EditDataGridCollectionDemoPanelComponent,

    TableDemoPanelComponent,

    TreeTableDemoPanelComponent,

    DataSourceErrorComponent,
    DataSourceDirective,
    NavigateBackButtonComponent,
    MatProgressBarModule,
    MatDividerModule,
    MatExpansionModule,
    PersistentAccordionDirective,
    CommonModule,
    AccordionHeaderComponent,
  ],
  providers: [
    ComplexAccordionDataSource,
    {
      provide: ACCORDION_DATA_SOURCE,
      useExisting: ComplexAccordionDataSource,
    },
    ComplexAccordionMethod,
  ],
})
export class ComplexAccordionComponent {

  constructor(
    public readonly accordionDataSource: ComplexAccordionDataSource,
  ) {}

}

export default ComplexAccordionComponent;
