import {
  BaseForm,
  BaseFormErrors
} from '../base.form';
import { mergeDeepRight } from 'ramda';

export interface FormGroupError extends BaseFormErrors {
  controls: { [controlId: string]: BaseFormErrors | null };
}

export class BaseFormGroup<GroupValue extends object> extends BaseForm<GroupValue, FormGroupError> {

  public readonly controls = new Map<string, BaseForm<GroupValue[keyof GroupValue]>>();

  public addControl(controlId: string, control: BaseForm<GroupValue[keyof GroupValue]>): void {
    this.controls.set(controlId, control);
    control.parent = this;
  }

  public removeControl(controlId: string): boolean {
    return this.controls.delete(controlId);
  }

  public getControl<T extends BaseForm<GroupValue> = BaseForm<GroupValue>>(controlId: string): T | null {
    const control: T | undefined = this.controls.get(controlId) as any;
    if (control) {
      return control;
    }
    // TODO : add logging
    return null;
  }

  public setValue(value: Partial<GroupValue>): void {
    super.setValue(mergeDeepRight<GroupValue, Partial<GroupValue>>(this.value, value) as GroupValue);
    for (const [controlId, controlValue] of Object.entries(value)) {
      if (this.controls.has(controlId)) {
        const control = this.controls.get(controlId);
        control.setValue(controlValue as any);
      }
      // TODO : add logging
    }
  }

  // public setErrors(errors: FormGroupError): void {
  //   super.setErrors(errors);
  //   for(const [controlId, controlError] of Object.entries(errors.controls)) {
  //     if (this.controls.has(controlId)) {
  //       const control = this.controls.get(controlId);
  //       control.setErrors(controlError);
  //     }
  //     // TODO : add logging
  //   }
  // }

  public clearErrors(): void {
    super.clearErrors();
    for (const control of this.controls.values()) {
      control.clearErrors();
    }
  }

}
