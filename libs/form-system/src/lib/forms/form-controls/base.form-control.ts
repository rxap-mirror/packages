import { BaseForm } from '../base.form';

export class BaseFormControl<ControlValue> extends BaseForm<ControlValue> {

  /**
   * the control input placeholder
   */
  public placeholder: string;

  /**
   * the control input label
   */
  public label: string;

  /**
   * weather this control is disabled
   */
  public disabled = false;

  /**
   * weather this control is readonly
   */
  public readonly = false;

  /**
   * weather this control is touched
   */
  public touched = false;

  public dirty = false;

}
