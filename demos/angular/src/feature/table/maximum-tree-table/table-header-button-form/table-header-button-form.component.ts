import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import {
  FormComponentProviders,
  FormProviders,
} from './form.providers';
import {
  FormControlsComponent,
  MaterialFormSystemModule,
} from '@rxap/material-form-system';
import { ReactiveFormsModule } from '@angular/forms';
import { RxapFormsModule } from '@rxap/forms';



@Component({
    selector: 'rxap-table-header-button-form',
    templateUrl: './table-header-button-form.component.html',
    styleUrls: ['./table-header-button-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    ReactiveFormsModule,
    MaterialFormSystemModule,
    FormControlsComponent,
    RxapFormsModule
],
    providers: [
        FormProviders,
        FormComponentProviders,
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
    ]
})
export class TableHeaderButtonFormComponent {}
