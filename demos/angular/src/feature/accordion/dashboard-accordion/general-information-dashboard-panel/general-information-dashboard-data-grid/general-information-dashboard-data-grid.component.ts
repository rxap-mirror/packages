import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataGridModule } from '@rxap/data-grid';
import { TableSelectControlModule } from '@rxap/ngx-material-table-select';
import { GeneralInformationDashboardDataGridDataSource } from './general-information-dashboard-data-grid.data-source';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormProviders, FormComponentProviders } from './form.providers';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'rxap-general-information-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, RxapFormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule, TableSelectControlModule],
  providers: [GeneralInformationDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationDashboardDataGridDataSource);
}
