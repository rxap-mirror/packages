import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GeneralInformationCloudDashboardDataGridComponent } from './general-information-cloud-dashboard-data-grid/general-information-cloud-dashboard-data-grid.component';

@Component({
    standalone: true,
    selector: 'rxap-general-information-cloud-dashboard-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-cloud-dashboard-panel.component.html',
    styleUrls: ['./general-information-cloud-dashboard-panel.component.scss'],
  imports: [GeneralInformationCloudDashboardDataGridComponent],
})
export class GeneralInformationCloudDashboardPanelComponent {
}
