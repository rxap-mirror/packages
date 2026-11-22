import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  FormProviders,
  FormComponentProviders,
} from './form.providers';

import { input } from '@angular/core';

import { DataGridComponent, DataGridRowDefDirective, DataGridEditCellDefDirective } from '@rxap/data-grid';
import { FormDirective } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'rxap-edit-data-grid-collection-demo-data-grid',
    templateUrl: './edit-data-grid-collection-demo-data-grid.component.html',
    styleUrls: ['./edit-data-grid-collection-demo-data-grid.component.scss'],
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
        FormProviders,
        FormComponentProviders,
    ]
})
export class EditDataGridCollectionDemoDataGridComponent {


  public readonly data = input<any>();


}
