import {
  ChangeDetectionStrategy,
  Component, inject } from '@angular/core';

import { DataGridDemoDataGridDataSource } from './data-grid-demo-data-grid.data-source';

import { DataGridComponent, DataGridRowDefDirective } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'rxap-data-grid-demo-data-grid',
    templateUrl: './data-grid-demo-data-grid.component.html',
    styleUrls: ['./data-grid-demo-data-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DataGridComponent, DataGridRowDefDirective,
        MatCardModule,
    ],
    providers: [
        DataGridDemoDataGridDataSource,
    ]
})
export class DataGridDemoDataGridComponent {


  public readonly dataGridDataSource = inject(DataGridDemoDataGridDataSource);


}
