import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { DataGridDemoDataGridDataSource } from './data-grid-demo-data-grid.data-source';

import { DataGridModule } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'rxap-data-grid-demo-data-grid',
  templateUrl: './data-grid-demo-data-grid.component.html',
  styleUrls: [ './data-grid-demo-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    MatCardModule,
  ],
  providers: [

    DataGridDemoDataGridDataSource,

  ],
})
export class DataGridDemoDataGridComponent {


  constructor(
    public readonly dataGridDataSource: DataGridDemoDataGridDataSource,
  ) {}


}
