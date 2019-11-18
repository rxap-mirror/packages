import {
  Component,
  ChangeDetectionStrategy,
  Input,
  forwardRef
} from '@angular/core';
import {
  SelectFormControl,
  RxapSelectMultipleControl,
  OptionsDataSourceToken
} from '../../forms/form-controls/select.form-control';
import { BaseControlComponent } from '../base-control.component';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { IconConfig } from '@rxap/utilities';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';

export function RxapSelectMultipleListControl(optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    RxapSelectMultipleControl(optionsDataSource)(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_MULTIPLE_LIST)(target, propertyKey);
  };
}

@RxapComponent(RxapFormControlComponentIds.SELECT_MULTIPLE_LIST)
@Component({
  selector:        'rxap-select-multiple-list-control',
  templateUrl:     './select-multiple-list-control.component.html',
  styleUrls:       [ './select-multiple-list-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapSelectMultipleListControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapSelectMultipleListControlComponent)
    }
  ],
})
export class RxapSelectMultipleListControlComponent<ControlValue>
  extends BaseControlComponent<ControlValue, SelectFormControl<ControlValue>> {

  @Input() public icon: string | IconConfig | null = null;

}
