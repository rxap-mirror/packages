import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { InputFormControl } from '../../forms/form-controls/input.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';

@RxapComponent(RxapFormControlComponentIds.INPUT)
@Component({
  selector:        'rxap-input-control',
  templateUrl:     './input-control.component.html',
  styleUrls:       [ './input-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: RxapInputControlComponent
    }
  ]
})
export class RxapInputControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, InputFormControl<ControlValue>> {}
