import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control.component';
import {
  DateFormControl,
  RxapDateAdapter
} from '../../forms/form-controls/date.form-control';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';
import { DateAdapter } from '@angular/material';

@Component({
  selector:        'rxap-date-control',
  templateUrl:     './date-control.component.html',
  styleUrls:       [ './date-control.component.scss' ],
  exportAs:        'rxapDateControl',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapDateControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapDateControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapDateControlComponent)
    },
    {
      provide:  DateAdapter,
      useClass: RxapDateAdapter
    }
  ]
})
export class RxapDateControlComponent
  extends NgModelControlComponent<number, DateFormControl> {}
