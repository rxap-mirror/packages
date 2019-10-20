import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { FormFieldFormControl } from './form-field.form-control';

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

  public type: InputTypes = InputTypes.TEXT;

  public max: number | null     = null;
  public min: number | null     = null;
  public pattern: RegExp | null = null;
  public componentId            = RxapFormControlComponentIds.INPUT;

}
