import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { Input } from '@angular/core';

import { DataGridModule } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'rxap-data-grid-collection-demo-data-grid',
  templateUrl: './data-grid-collection-demo-data-grid.component.html',
  styleUrls: [ './data-grid-collection-demo-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    MatCardModule,
  ],
  providers: [],
})
export class DataGridCollectionDemoDataGridComponent {


  @Input() data!: any;


}
