import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  FormProviders,
  FormComponentProviders,
} from './form.providers';

import { Input } from '@angular/core';

import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'rxap-edit-data-grid-collection-demo-data-grid',
  templateUrl: './edit-data-grid-collection-demo-data-grid.component.html',
  styleUrls: [ './edit-data-grid-collection-demo-data-grid.component.scss' ],
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

    FormProviders,
    FormComponentProviders,
  ],
})
export class EditDataGridCollectionDemoDataGridComponent {


  @Input() data!: any;


}
