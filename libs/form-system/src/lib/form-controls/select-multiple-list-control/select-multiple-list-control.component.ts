import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import {
  SelectFormControl,
  RxapSelectMultipleControl
} from '../../forms/form-controls/select.form-control';
import { TextFilterService } from '../../utilities/text-filter/text-filter.service';
import { OptionTextFilterService } from '../../utilities/text-filter/option-text-filter.service';
import { BaseControlComponent } from '../base-control.component';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { IconConfig } from '@rxap/utilities';

export function RxapSelectMultipleListControl() {
  return function(target: any, propertyKey: string) {
    RxapSelectMultipleControl()(target, propertyKey);
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
      provide:  TextFilterService,
      useClass: OptionTextFilterService
    }
  ]
})
export class SelectMultipleListControlComponent<ControlValue>
  extends BaseControlComponent<ControlValue, SelectFormControl<ControlValue>> {

  @Input() public icon: string | IconConfig | null = null;

}
