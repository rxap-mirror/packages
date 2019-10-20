import { FormFieldFormControl } from './form-field.form-control';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapControlProperties } from '../../form-definition/decorators/control-property';

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

export class TextareaFormControl extends FormFieldFormControl<string> {

  public maxRows = Number.MAX_SAFE_INTEGER;
  public minRows = 0;

  public autosize = true;

  public componentId = RxapFormControlComponentIds.TEXTAREA;

}
