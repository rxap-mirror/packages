import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { CheckboxFormControl } from '../../forms/form-controls/checkbox.form-control';
import { NgModelControlComponent } from '../ng-model-control.component';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.CHECKBOX)
@Component({
  selector:        'rxap-checkbox-control',
  templateUrl:     './checkbox-control.component.html',
  styleUrls:       [ './checkbox-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapCheckboxControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapCheckboxControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapCheckboxControlComponent)
    }
  ]
})
export class RxapCheckboxControlComponent
  extends NgModelControlComponent<boolean, CheckboxFormControl> {}
