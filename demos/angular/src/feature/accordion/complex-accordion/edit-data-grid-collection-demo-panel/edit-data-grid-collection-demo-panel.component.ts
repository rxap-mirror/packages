import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditDataGridCollectionDemoDataGridDataSource } from './edit-data-grid-collection-demo-data-grid/edit-data-grid-collection-demo-data-grid.data-source';
import { CommonModule, AsyncPipe, JsonPipe } from '@angular/common';
import { EditDataGridCollectionDemoDataGridComponent } from './edit-data-grid-collection-demo-data-grid/edit-data-grid-collection-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EditDataGridCollectionDemoPanelDataSource } from './edit-data-grid-collection-demo-panel.data-source';
import { EditDataGridCollectionDemoPanelMethod } from './edit-data-grid-collection-demo-panel.method';

@Component({
    selector: 'rxap-edit-data-grid-collection-demo-panel',
    templateUrl: './edit-data-grid-collection-demo-panel.component.html',
    styleUrls: ['./edit-data-grid-collection-demo-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        EditDataGridCollectionDemoDataGridComponent,
        DataSourceDirective,
        CommonModule,
        DataSourceErrorComponent,
        MatProgressBarModule,
        AsyncPipe,
        JsonPipe,
    ],
    providers: [
        EditDataGridCollectionDemoDataGridDataSource,
        EditDataGridCollectionDemoPanelDataSource,
        EditDataGridCollectionDemoPanelMethod,
    ]
})
export class EditDataGridCollectionDemoPanelComponent {
  constructor(
    public readonly dataGridDataSource: EditDataGridCollectionDemoDataGridDataSource
  ) {}

  public readonly panelDataSource = inject(
    EditDataGridCollectionDemoPanelDataSource
  );
}
