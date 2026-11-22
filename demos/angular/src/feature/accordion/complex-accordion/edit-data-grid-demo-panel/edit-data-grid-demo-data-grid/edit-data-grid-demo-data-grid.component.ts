import {
  ChangeDetectionStrategy,
  Component, inject } from '@angular/core';
import {
  FormProviders,
  FormComponentProviders,
} from './form.providers';

import { EditDataGridDemoDataGridDataSource } from './edit-data-grid-demo-data-grid.data-source';

import { DataGridComponent, DataGridRowDefDirective, DataGridEditCellDefDirective } from '@rxap/data-grid';
import { FormDirective } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'rxap-edit-data-grid-demo-data-grid',
    templateUrl: './edit-data-grid-demo-data-grid.component.html',
    styleUrls: ['./edit-data-grid-demo-data-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DataGridComponent, DataGridRowDefDirective, DataGridEditCellDefDirective,
        FormDirective,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatSlideToggleModule,
    ],
    providers: [
        EditDataGridDemoDataGridDataSource,
        FormProviders,
        FormComponentProviders,
    ]
})
export class EditDataGridDemoDataGridComponent {


  public readonly dataGridDataSource = inject(EditDataGridDemoDataGridDataSource);


}
