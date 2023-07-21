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
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RxapFormsModule } from '@rxap/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'rxap-table-header-button-form',
  templateUrl: './table-header-button-form.component.html',
  styleUrls: [ './table-header-button-form.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialFormSystemModule,
    FormControlsComponent,
    RxapFormsModule,

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

  ],
})
export class TableHeaderButtonFormComponent {}
