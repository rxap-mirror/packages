import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { EditDataGridCollectionDemoDataGridDataSource } from './edit-data-grid-collection-demo-data-grid/edit-data-grid-collection-demo-data-grid.data-source';
import { CommonModule } from '@angular/common';
import { EditDataGridCollectionDemoDataGridComponent } from './edit-data-grid-collection-demo-data-grid/edit-data-grid-collection-demo-data-grid.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'rxap-edit-data-grid-collection-demo-panel',
  templateUrl: './edit-data-grid-collection-demo-panel.component.html',
  styleUrls: [ './edit-data-grid-collection-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    EditDataGridCollectionDemoDataGridComponent,
    DataSourceDirective,
    CommonModule,
    DataSourceErrorComponent,
    MatProgressBarModule,
  ],
  providers: [
    EditDataGridCollectionDemoDataGridDataSource,
  ],
})
export class EditDataGridCollectionDemoPanelComponent {

  constructor(
    public readonly dataGridDataSource: EditDataGridCollectionDemoDataGridDataSource,
  ) {}

}
