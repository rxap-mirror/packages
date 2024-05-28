import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataGridCollectionDemoDataGridDataSource } from './data-grid-collection-demo-data-grid/data-grid-collection-demo-data-grid.data-source';
import { CommonModule, AsyncPipe, JsonPipe } from '@angular/common';
import { DataGridCollectionDemoDataGridComponent } from './data-grid-collection-demo-data-grid/data-grid-collection-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataGridCollectionDemoPanelDataSource } from './data-grid-collection-demo-panel.data-source';
import { DataGridCollectionDemoPanelMethod } from './data-grid-collection-demo-panel.method';

@Component({
  selector: 'rxap-data-grid-collection-demo-panel',
  templateUrl: './data-grid-collection-demo-panel.component.html',
  styleUrls: ['./data-grid-collection-demo-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridCollectionDemoDataGridComponent,
    DataSourceDirective,
    CommonModule,
    DataSourceErrorComponent,
    MatProgressBarModule,
    AsyncPipe,
    JsonPipe,
  ],
  providers: [
    DataGridCollectionDemoDataGridDataSource,
    DataGridCollectionDemoPanelDataSource,
    DataGridCollectionDemoPanelMethod,
  ],
})
export class DataGridCollectionDemoPanelComponent {
  constructor(
    public readonly dataGridDataSource: DataGridCollectionDemoDataGridDataSource
  ) {}

  public readonly panelDataSource = inject(
    DataGridCollectionDemoPanelDataSource
  );
}
