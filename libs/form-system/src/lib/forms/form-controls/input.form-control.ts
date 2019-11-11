import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import {
  FormFieldFormControl,
  IFormFieldFormControl
} from './form-field.form-control';
import {
  BaseForm,
  SetValueOptions
} from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';

export interface IInputFormControl<ControlValue> extends IFormFieldFormControl<ControlValue> {
  type: InputTypes;
  max: number | null;
  min: number | null;
  pattern: RegExp | null;
}

export enum InputTypes {
  COLOR          = 'color',
  DATE           = 'date',
  DATETIME_LOCAL = 'datetime-local',
  EMAIL          = 'email',
  MONTH          = 'month',
  NUMBER         = 'number',
  PASSWORD       = 'password',
  SEARCH         = 'search',
  TEL            = 'tel',
  TEXT           = 'text',
  TIME           = 'time',
  URL            = 'url',
  WEEK           = 'week',
}

export class InputFormControl<ControlValue>
  extends FormFieldFormControl<ControlValue> {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): InputFormControl<any> {
    return new InputFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<IInputFormControl<ControlValue>> = {}): InputFormControl<ControlValue> {
    const control       = InputFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, options);
    return control;
  }

  public type: InputTypes = InputTypes.TEXT;

  public max: number | null     = null;
  public min: number | null     = null;
  public pattern: RegExp | null = null;
  public componentId            = RxapFormControlComponentIds.INPUT;

  public setValue(value: ControlValue | null, options: Partial<SetValueOptions> = {}): void {
    let typedValue: any = value;
    switch (this.type) {
      case InputTypes.NUMBER:
        typedValue = Number(value);
        if (isNaN(typedValue)) {
          typedValue = null;
        }
    }
    super.setValue(typedValue, options);
  }

}
