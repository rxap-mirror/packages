import {
  SelectFormControl,
  OptionsDataSourceToken,
  ISelectFormControl
} from './select.form-control';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { DeleteUndefinedProperties } from '@rxap/utilities';

export function RxapSelectListControl(optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', SelectListFormControl)(target, propertyKey);
    RxapControlProperty('optionsDataSource', optionsDataSource)(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_LIST)(target, propertyKey);
  };
}

export type CheckboxPosition = 'before' | 'after';

export interface ISelectListFormControl<ControlValue> extends ISelectFormControl<ControlValue> {
  checkboxPosition: CheckboxPosition
}

export class SelectListFormControl<ControlValue>
  extends SelectFormControl<ControlValue> {

  public static EMPTY<ControlValue>(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): SelectListFormControl<ControlValue> {
    return new SelectListFormControl<ControlValue>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<ISelectListFormControl<ControlValue>> = {}): SelectListFormControl<ControlValue> {
    const control       = SelectListFormControl.EMPTY<ControlValue>();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, DeleteUndefinedProperties(options));
    return control;
  }

  public checkboxPosition: CheckboxPosition = 'before';

}
