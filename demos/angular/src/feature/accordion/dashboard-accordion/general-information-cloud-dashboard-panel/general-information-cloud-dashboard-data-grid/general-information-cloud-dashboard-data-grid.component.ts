import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataGridModule } from '@rxap/data-grid';
import { GeneralInformationCloudDashboardDataGridDataSource } from './general-information-cloud-dashboard-data-grid.data-source';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormProviders, FormComponentProviders } from './form.providers';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'rxap-general-information-cloud-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-cloud-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-cloud-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, RxapFormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule],
  providers: [GeneralInformationCloudDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationCloudDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationCloudDashboardDataGridDataSource);
}
