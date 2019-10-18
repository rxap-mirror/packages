import {
  BaseForm,
  BaseFormErrors
} from '../base.form';
import { mergeDeepRight } from 'ramda';

export interface FormArrayError extends BaseFormErrors {
  controls: Array<null | BaseFormErrors>;
}

export class BaseFormArray<ArrayValue> extends BaseForm<ArrayValue[], FormArrayError> {

  public readonly controls: BaseForm<ArrayValue>[] = [];

  public addControl(control: BaseForm<ArrayValue>, index?: number): void {
    if (index !== undefined) {
      this.controls.splice(index, 0, control);
    }
    this.controls.push(control);
    control.parent = this;
  }

  public removeControl(index: number): boolean {
    if (this.controls.length > index) {
      this.controls.splice(index, 1);
      return true;
    }
    // TODO : add logging
    return false;
  }

  public getControl
  <T extends BaseForm<ArrayValue> = BaseForm<ArrayValue>>
  (index: number): T | null {
    if (this.controls.length > index) {
      return this.controls[index] as any;
    }
    // TODO : add logging
    return null;
  }

  public setValue(value: Array<Partial<ArrayValue>>): void {
    super.setValue(mergeDeepRight<ArrayValue[], Array<Partial<ArrayValue>>>(this.value, value) as ArrayValue[]);
    for (let controlIndex = 0; controlIndex < value.length; controlIndex++) {
      if (this.controls.length > controlIndex) {
        const control = this.controls[ controlIndex ];
        const controlValue = value[controlIndex];
        if (typeof controlValue === 'object') {
          // TODO : handel case where control.value is not an object
          control.setValue(mergeDeepRight(control.value as any, controlValue) as ArrayValue);
        } else {
          control.setValue(controlValue);
        }
      }
      // TODO : add logging
    }

  }

  // public setErrors(errors: FormArrayError): void {
  //   super.setErrors(errors);
  //   for (let controlIndex = 0; controlIndex < errors.controls.length; controlIndex++) {
  //     if (this.controls.length > controlIndex) {
  //       const control = this.controls[ controlIndex ];
  //       control.setErrors(errors.controls[controlIndex]);
  //     }
  //     // TODO : add logging
  //   }
  // }

  public clearErrors(): void {
    super.clearErrors();
    for (const control of this.controls) {
      control.clearErrors();
    }
  }

}
