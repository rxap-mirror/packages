import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { RadioButtonFormControl } from '../../forms/form-controls/radio-button.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.RADIO_BUTTON)
@Component({
  selector:        'rxap-radio-button-control',
  templateUrl:     './radio-button-control.component.html',
  styleUrls:       [ './radio-button-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapRadioButtonControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapRadioButtonControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapRadioButtonControlComponent)
    }
  ]
})
export class RxapRadioButtonControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, RadioButtonFormControl<ControlValue>> {}

{}
