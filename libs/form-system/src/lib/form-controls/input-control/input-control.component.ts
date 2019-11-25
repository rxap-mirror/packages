import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { InputFormControl } from '../../forms/form-controls/input.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.INPUT)
@Component({
  selector:        'rxap-input-control',
  templateUrl:     './input-control.component.html',
  styleUrls:       [ './input-control.component.scss' ],
  exportAs:        'rxapInputControl',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapInputControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapInputControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapInputControlComponent)
    }
  ]
})
export class RxapInputControlComponent<ControlValue, FormControl extends InputFormControl<ControlValue> = InputFormControl<ControlValue>>
  extends NgModelControlComponent<ControlValue, FormControl> {}
