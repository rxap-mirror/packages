import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  FormProviders,
  FormComponentProviders,
} from './form.providers';

import { EditDataGridDemoDataGridDataSource } from './edit-data-grid-demo-data-grid.data-source';

import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'rxap-edit-data-grid-demo-data-grid',
  templateUrl: './edit-data-grid-demo-data-grid.component.html',
  styleUrls: [ './edit-data-grid-demo-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    RxapFormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  providers: [

    EditDataGridDemoDataGridDataSource,

    FormProviders,
    FormComponentProviders,
  ],
})
export class EditDataGridDemoDataGridComponent {


  constructor(
    public readonly dataGridDataSource: EditDataGridDemoDataGridDataSource,
  ) {}


}
