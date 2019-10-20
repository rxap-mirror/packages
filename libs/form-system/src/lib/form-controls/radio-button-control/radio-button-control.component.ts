import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control-component.service';
import { RadioButtonFormControl } from '../../forms/form-controls/radio-button.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';

@RxapComponent(RxapFormControlComponentIds.RADIO_BUTTON)
@Component({
  selector:        'rxap-radio-button-control',
  templateUrl:     './radio-button-control.component.html',
  styleUrls:       [ './radio-button-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, RadioButtonFormControl<ControlValue>> {}

{}
