import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { DataGridDemoDataGridComponent } from './data-grid-demo-data-grid/data-grid-demo-data-grid.component';

@Component({
  selector: 'rxap-data-grid-demo-panel',
  templateUrl: './data-grid-demo-panel.component.html',
  styleUrls: [ './data-grid-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridDemoDataGridComponent,
  ],
})
export class DataGridDemoPanelComponent {}
