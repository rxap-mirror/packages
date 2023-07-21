import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { DataGridCollectionDemoDataGridDataSource } from './data-grid-collection-demo-data-grid/data-grid-collection-demo-data-grid.data-source';
import { CommonModule } from '@angular/common';
import { DataGridCollectionDemoDataGridComponent } from './data-grid-collection-demo-data-grid/data-grid-collection-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'rxap-data-grid-collection-demo-panel',
  templateUrl: './data-grid-collection-demo-panel.component.html',
  styleUrls: [ './data-grid-collection-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridCollectionDemoDataGridComponent,
    DataSourceDirective,
    CommonModule,
    DataSourceErrorComponent,
    MatProgressBarModule,
  ],
  providers: [
    DataGridCollectionDemoDataGridDataSource,
  ],
})
export class DataGridCollectionDemoPanelComponent {

  constructor(
    public readonly dataGridDataSource: DataGridCollectionDemoDataGridDataSource,
  ) {}

}
