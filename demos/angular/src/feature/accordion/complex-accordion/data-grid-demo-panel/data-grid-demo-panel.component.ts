import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataGridDemoDataGridComponent } from './data-grid-demo-data-grid/data-grid-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { DataGridDemoPanelDataSource } from './data-grid-demo-panel.data-source';
import { DataGridDemoPanelMethod } from './data-grid-demo-panel.method';

@Component({
  selector: 'rxap-data-grid-demo-panel',
  templateUrl: './data-grid-demo-panel.component.html',
  styleUrls: ['./data-grid-demo-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridDemoDataGridComponent,
    DataSourceDirective,
    MatProgressBarModule,
    DataSourceErrorComponent,
    AsyncPipe,
    JsonPipe,
  ],
  providers: [DataGridDemoPanelDataSource, DataGridDemoPanelMethod],
})
export class DataGridDemoPanelComponent {
  public readonly panelDataSource = inject(DataGridDemoPanelDataSource);
}
