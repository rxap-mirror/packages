import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { SelectFormControl } from '../../forms/form-controls/select.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { ControlOptions } from '@rxap/utilities';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';

@RxapComponent(RxapFormControlComponentIds.SELECT)
@Component({
  selector:        'rxap-select-control',
  templateUrl:     './select-control.component.html',
  styleUrls:       [ './select-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: SelectControlComponent
    }
  ]
})
export class SelectControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectFormControl<ControlValue>> {

  @Input()
  public set options(value: ControlOptions<ControlValue>) {
    this.control.options = value;
  }

}
