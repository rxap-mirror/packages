import {
  Component,
  ChangeDetectionStrategy,
  Input,
  forwardRef
} from '@angular/core';
import {
  SelectFormControl,
  OptionsDataSourceToken
} from '../../forms/form-controls/select.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { ControlOptions } from '@rxap/utilities';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.SELECT)
@Component({
  selector:        'rxap-select-control',
  templateUrl:     './select-control.component.html',
  styleUrls:       [ './select-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    }
  ]
})
export class RxapSelectControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectFormControl<ControlValue>> {

  @Input()
  public set options(value: ControlOptions<ControlValue>) {
    this.control.options = value;
  }

  @Input()
  public set optionsDataSource(value: OptionsDataSourceToken<ControlValue>) {
    this.control.updateOptionsDataSourceToken(value);
  }

}
