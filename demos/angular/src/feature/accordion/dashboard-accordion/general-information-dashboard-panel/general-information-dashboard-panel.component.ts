import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GeneralInformationDashboardDataGridComponent } from './general-information-dashboard-data-grid/general-information-dashboard-data-grid.component';

@Component({
    standalone: true,
    selector: 'rxap-general-information-dashboard-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-dashboard-panel.component.html',
    styleUrls: ['./general-information-dashboard-panel.component.scss'],
  imports: [GeneralInformationDashboardDataGridComponent],
})
export class GeneralInformationDashboardPanelComponent {
}
