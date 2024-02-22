import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataGridModule } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';
import { GeneralInformationCloudDashboardDataGridDataSource } from './general-information-cloud-dashboard-data-grid.data-source';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormProviders, FormComponentProviders } from './form.providers';

@Component({
    standalone: true,
    selector: 'rxap-general-information-cloud-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-cloud-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-cloud-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, MatCardModule, RxapFormsModule, ReactiveFormsModule],
  providers: [GeneralInformationCloudDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationCloudDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationCloudDashboardDataGridDataSource);
}
