import {
  SelectFormControl,
  OptionsDataSourceToken
} from './select.form-control';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';

export function RxapSelectListControl(optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', SelectListFormControl)(target, propertyKey);
    RxapControlProperty('OptionsDataSourceToken', optionsDataSource)(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_LIST)(target, propertyKey);
  };
}

export type CheckboxPosition = 'before' | 'after';

export class SelectListFormControl<ControlValue>
  extends SelectFormControl<ControlValue> {

  public checkboxPosition: CheckboxPosition = 'before';

}
