import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditDataGridDemoDataGridComponent } from './edit-data-grid-demo-data-grid/edit-data-grid-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { EditDataGridDemoPanelDataSource } from './edit-data-grid-demo-panel.data-source';
import { EditDataGridDemoPanelMethod } from './edit-data-grid-demo-panel.method';

@Component({
    selector: 'rxap-edit-data-grid-demo-panel',
    templateUrl: './edit-data-grid-demo-panel.component.html',
    styleUrls: ['./edit-data-grid-demo-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        EditDataGridDemoDataGridComponent,
        DataSourceDirective,
        MatProgressBarModule,
        DataSourceErrorComponent,
        AsyncPipe,
        JsonPipe,
    ],
    providers: [EditDataGridDemoPanelDataSource, EditDataGridDemoPanelMethod]
})
export class EditDataGridDemoPanelComponent {
  public readonly panelDataSource = inject(EditDataGridDemoPanelDataSource);
}
