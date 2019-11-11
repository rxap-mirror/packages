import {
  BaseForm,
  BaseFormErrors
} from '../base.form';
import { Subject } from 'rxjs';
import { ParentForm } from '../parent.form';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { Injector } from '@angular/core';

export interface IBaseFormControl<ControlValue> {
  placeholder: string;
  label: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  name: string;
  initial: ControlValue;
}

export class BaseFormControl<ControlValue> extends BaseForm<ControlValue | null,
  BaseFormErrors,
  ControlValue | null> {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): BaseFormControl<any> {
    return new BaseFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<IBaseFormControl<ControlValue>> = {}): BaseFormControl<ControlValue> {
    const control       = BaseFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, options);
    return control;
  }

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

  public required = false;

  public dirty = false;

  public name: string;

  public componentId: string | null = null;

  public initial: ControlValue | null = null;

  /**
   * indicates that the component view must be updated
   */
  public updateView$ = new Subject<void>();

  constructor(controlId: string, parent: ParentForm<any>, injector: Injector) {
    super(parent.formId, controlId, injector, parent);
    this.placeholder = `FORMS.${this.controlPath}.PLACEHOLDER`;
    this.label       = `FORMS.${this.controlPath}.LABEL`;
    this.name        = [ this.formId, this.controlPath ].join('.');
  }

  public init() {
    super.init();
    this.setValue(this.initial);
  }

  public clearError(key: string): boolean {
    const result = super.clearError(key);
    this.updateView$.next();
    return result;
  }

  public clearErrors(): void {
    super.clearErrors();
    this.updateView$.next();
  }

  public reset() {
    this.setValue(this.initial);
    super.reset();
    this.updateView$.next();
  }

  public setError(key: string, error: string): void {
    super.setError(key, error);
    this.updateView$.next();
  }

}
