import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControlsComponent } from '@rxap/material-form-system';
import { RxapFormsModule } from '@rxap/forms';
import { FormWindowFooterDirective } from '@rxap/form-window-system';
import { RXAP_WINDOW_SETTINGS } from '@rxap/window-system';
import { FormProviders, FormComponentProviders } from './form.providers';

@Component({
  standalone: true,
  selector: 'rxap-maximum-tree-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './maximum-tree-form.component.html',
  styleUrls: ['./maximum-tree-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    FormControlsComponent,
    RxapFormsModule,
    FormWindowFooterDirective,
  ],
  providers: [
    {
      provide: RXAP_WINDOW_SETTINGS,
      useValue: {
        title: $localize`MaximumTree`,
      },
    },
    FormProviders,
    FormComponentProviders,
  ],
})
export class MaximumTreeFormComponent {}
