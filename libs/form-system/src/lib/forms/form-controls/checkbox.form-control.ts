import {
  BaseFormControl,
  IBaseFormControl
} from './base.form-control';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapControlProperties } from '../../form-definition/decorators/control-property';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';

export type CheckboxLabelPosition = 'before' | 'after';

export interface ICheckboxFormControlOptions {
  indeterminate: boolean;
  labelPosition: CheckboxLabelPosition;
}

export interface ICheckboxFormControl<ControlValue> extends IBaseFormControl<ControlValue> {
  indeterminate: boolean;
  labelPosition: CheckboxLabelPosition;
}

export function RxapCheckboxControl(options: Partial<ICheckboxFormControlOptions> = {}) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', CheckboxFormControl)(target, propertyKey);
    RxapControlProperties(options)(target, propertyKey);
  };
}

export class CheckboxFormControl<ControlValue = boolean> extends BaseFormControl<ControlValue> {

  public static EMPTY<ControlValue>(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): CheckboxFormControl<ControlValue> {
    return new CheckboxFormControl('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<ICheckboxFormControl<ControlValue>> = {}): CheckboxFormControl<ControlValue> {
    const control       = CheckboxFormControl.EMPTY<ControlValue>();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, options);
    return control;
  }

  public indeterminate                        = false;
  public labelPosition: CheckboxLabelPosition = 'after';
  public componentId: string                  = RxapFormControlComponentIds.CHECKBOX;

}
