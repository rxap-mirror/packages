import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormWindowFooterDirective } from '@rxap/form-window-system';
import { RxapFormsModule } from '@rxap/forms';
import {
  FormControlsComponent,
  MaterialFormSystemModule,
} from '@rxap/material-form-system';

import {
  FormComponentProviders,
  FormProviders,
} from './form.providers';


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
    FormWindowFooterDirective,

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
