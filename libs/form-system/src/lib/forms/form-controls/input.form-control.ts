import { BaseFormControl } from './base.form-control';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';

export type InputTyp = 'color' | 'date' | 'datetime-local' | 'email' | 'month' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week';

export type AppearanceType = 'legacy' | 'standard' | 'fill' | 'outline';

export class InputFormControl<ControlValue> extends BaseFormControl<ControlValue> {

  public type: InputTyp = 'text';

  public max: number | null         = null;
  public min: number | null         = null;
  public pattern: RegExp | null     = null;
  public appearance: AppearanceType = 'standard';
  public icon: string | null        = null;
  public componentId                = RxapFormControlComponentIds.INPUT;
}
