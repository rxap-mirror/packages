import {
  FormFieldFormControl,
  IFormFieldFormControl
} from './form-field.form-control';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapControlProperties } from '../../form-definition/decorators/control-property';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { DeleteUndefinedProperties } from '@rxap/utilities';

export interface TextareaOptions {
  maxRows: number;
  minRows: number;
  autosize: boolean;
}

export function RxapTextareaControl(options: Partial<TextareaOptions> = {}) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', TextareaFormControl)(target, propertyKey);
    RxapControlProperties(options)(target, propertyKey);
  };
}

export interface ITextareaFormControl<ControlValue = string> extends IFormFieldFormControl<ControlValue> {
  maxRows: number;
  minRows: number;
  autosize: boolean;
}

export class TextareaFormControl<ControlValue = string> extends FormFieldFormControl<ControlValue> {

  public static EMPTY<ControlValue = string>(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): TextareaFormControl<ControlValue> {
    return new TextareaFormControl('control', parent, null as any);
  }

  public static STANDALONE<ControlValue = string>(options: Partial<ITextareaFormControl<ControlValue>> = {}): TextareaFormControl<ControlValue> {
    const control       = TextareaFormControl.EMPTY<ControlValue>();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, DeleteUndefinedProperties(options));
    return control;
  }

  public maxRows = Number.MAX_SAFE_INTEGER;
  public minRows = 0;

  public autosize = true;

  public componentId = RxapFormControlComponentIds.TEXTAREA;

}
