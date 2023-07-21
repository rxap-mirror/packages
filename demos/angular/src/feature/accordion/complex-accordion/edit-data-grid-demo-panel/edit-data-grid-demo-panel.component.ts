import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { EditDataGridDemoDataGridComponent } from './edit-data-grid-demo-data-grid/edit-data-grid-demo-data-grid.component';

@Component({
  selector: 'rxap-edit-data-grid-demo-panel',
  templateUrl: './edit-data-grid-demo-panel.component.html',
  styleUrls: [ './edit-data-grid-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    EditDataGridDemoDataGridComponent,
  ],
})
export class EditDataGridDemoPanelComponent {}
