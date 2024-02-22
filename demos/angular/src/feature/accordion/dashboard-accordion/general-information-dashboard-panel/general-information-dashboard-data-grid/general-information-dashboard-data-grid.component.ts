import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataGridModule } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';
import { GeneralInformationDashboardDataGridDataSource } from './general-information-dashboard-data-grid.data-source';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormProviders, FormComponentProviders } from './form.providers';
import { MatInputModule } from '@angular/material/input';

@Component({
    standalone: true,
    selector: 'rxap-general-information-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, MatCardModule, RxapFormsModule, ReactiveFormsModule, MatInputModule],
  providers: [GeneralInformationDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationDashboardDataGridDataSource);
}
