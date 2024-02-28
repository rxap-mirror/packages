import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import { TableSelectControlModule } from '@rxap/ngx-material-table-select';
import { GetFromObjectPipe } from '@rxap/pipes';
import {
  FormComponentProviders,
  FormProviders,
} from './form.providers';
import { GeneralInformationDashboardDataGridDataSource } from './general-information-dashboard-data-grid.data-source';

@Component({
    standalone: true,
    selector: 'rxap-general-information-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, RxapFormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule, InputClearButtonDirective, AsyncPipe, GetFromObjectPipe, TableSelectControlModule,],
  providers: [GeneralInformationDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationDashboardDataGridDataSource);
}
