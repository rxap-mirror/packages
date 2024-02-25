import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import {
  FormComponentProviders,
  FormProviders,
} from './form.providers';
import { GeneralInformationDashboardDataGridDataSource } from './general-information-dashboard-data-grid.data-source';
import { InputClearButtonDirective } from '@rxap/material-form-system';

@Component({
    standalone: true,
    selector: 'rxap-general-information-dashboard-data-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './general-information-dashboard-data-grid.component.html',
    styleUrls: ['./general-information-dashboard-data-grid.component.scss'],
  imports: [DataGridModule, MatCardModule, RxapFormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule, InputClearButtonDirective],
  providers: [GeneralInformationDashboardDataGridDataSource, FormProviders, FormComponentProviders],
})
export class GeneralInformationDashboardDataGridComponent {
  public readonly dataGridDataSource = inject(GeneralInformationDashboardDataGridDataSource);
}
