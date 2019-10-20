import {
  BaseForm,
  BaseFormErrors
} from '../base.form';
import { clone } from 'ramda';
import { ParentForm } from '../parent.form';
import { KeyValue } from '@rxap/utilities';

export interface FormArrayError extends BaseFormErrors {
  controls: Array<null | BaseFormErrors>;
}

export class BaseFormArray<ArrayValue> extends BaseForm<ArrayValue[], FormArrayError> {

  public readonly controls: BaseForm<ArrayValue>[] = [];

  constructor(
    public readonly formId: string,
    public readonly controlId: string,
    public readonly controlTemplate: BaseForm<ArrayValue>,
    // TODO : add parent type
    public readonly parent: ParentForm<any> | null = null
  ) {
    super(formId, controlId, parent);
  }

  public addControl(control: BaseForm<ArrayValue>, indexOrString?: number | string): void {
    if (control.parent !== this) {
      throw new Error('Can not add control if parent is not equal to this form array');
    }
    if (indexOrString !== undefined) {
      const index = typeof indexOrString === 'number' ? indexOrString : Number(indexOrString);
      if (isNaN(index)) {
        throw new Error('Can not add control with invalid index to this form array');
      }
      this.controls.splice(index, 0, control);
    }
    this.controls.push(control);
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
  (indexOrString: string | number): T | null {
    const index = typeof indexOrString === 'number' ? indexOrString : Number(indexOrString);
    if (isNaN(index)) {
      throw new Error('Can not add control with invalid index to this form array');
    }
    if (this.controls.length > index) {
      return this.controls[index] as any;
    }
    // TODO : add logging
    return null;
  }

  public hasControl(indexOrString: number | string): boolean {
    const index = typeof indexOrString === 'number' ? indexOrString : Number(indexOrString);
    if (isNaN(index)) {
      throw new Error('Can not add control with invalid index to this form array');
    }
    return this.controls.length > index;
  }

  public addNewControl(initialValue: Partial<ArrayValue>) {}

  public init(): void {
    super.init();
    this.controls.forEach(control => control.init());
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

  public setValue(value: Array<ArrayValue> | KeyValue<ArrayValue>): void {
    let newValue: Array<ArrayValue>;
    if (!Array.isArray(value)) {
      newValue = clone(this.value);

      for (const index of Object.keys(value).map(indexString => {
        const i = Number(indexString);
        if (isNaN(i)) {
          throw new Error('Can not set value for form array. Index is not valid');
        }
        return i;
      }).sort()) {
        const controlValue = value[ index.toFixed(0) ];
        if (index > newValue.length) {
          throw new Error('Can not set value for form array. Index is out of range');
        }
        if (index === newValue.length) {
          this.addNewControl(controlValue);
          newValue.push(controlValue);
        } else {
          newValue[ index ] = controlValue;
        }
      }

    } else {
      if (this.value.length !== value.length) {
        throw new Error('Can not set value. new value length is not equal to the old value length');
      }
      newValue = value;
    }

    super.setValue(newValue);
    for (let controlIndex = 0; controlIndex < newValue.length; controlIndex++) {
      if (this.controls.length > controlIndex) {
        const control      = this.controls[ controlIndex ];
        const controlValue = newValue[ controlIndex ];
        control.setValue(controlValue);
      }
      // TODO : add logging
    }

  }

}
