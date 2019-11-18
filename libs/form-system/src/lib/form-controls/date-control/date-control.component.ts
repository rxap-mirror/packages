import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control.component';
import { DateFormControl } from '../../forms/form-controls/date.form-control';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@Component({
  selector:        'rxap-date-control',
  templateUrl:     './date-control.component.html',
  styleUrls:       [ './date-control.component.scss' ],
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
    }
  ]
})
export class RxapDateControlComponent
  extends NgModelControlComponent<number, DateFormControl> {}
