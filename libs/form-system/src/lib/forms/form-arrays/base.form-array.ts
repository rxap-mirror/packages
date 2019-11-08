import {
  BaseForm,
  BaseFormErrors,
  SetValueOptions
} from '../base.form';
import { clone } from 'ramda';
import { ParentForm } from '../parent.form';
import {
  KeyValue,
  RecursivePartial
} from '@rxap/utilities';
import { BaseFormControl } from '../form-controls/base.form-control';
import { Injector } from '@angular/core';

export interface FormArrayError extends BaseFormErrors {
  controls: Array<null | BaseFormErrors>;
}

export class BaseFormArray<ItemValue,
  Form extends BaseForm<ItemValue, any, any>>
  extends BaseForm<Array<ItemValue>,
    FormArrayError,
    Array<RecursivePartial<ItemValue>>> {

  public static EMPTY(parent?: BaseForm<any, any, any>): BaseFormArray<any, any> {
    return new BaseFormArray<any, any>('empty', 'array', BaseFormControl, null as any, parent);
  }

  public readonly controls: Form[] = [];

  constructor(
    public readonly formId: string,
    public readonly controlId: string,
    public readonly controlTemplate: Form,
    injector: Injector,
    // TODO : add parent type
    public readonly parent: ParentForm<any> | null = null
  ) {
    super(formId, controlId, injector, parent);
  }

  public addControl(control: Form, indexOrString?: number | string): void {
    if (control.parent !== this) {
      throw new Error('Can not add control if parent is not equal to this form array');
    }
    if (this.initialized) {
      control.init();
    }
    if (indexOrString !== undefined) {
      const index = typeof indexOrString === 'number' ? indexOrString : Number(indexOrString);
      if (isNaN(index)) {
        throw new Error('Can not add control with invalid index to this form array');
      }
      this.controls.splice(index, 0, control);
    } else {
      indexOrString = this.controls.length;
    }
    this.controls.push(control);
    // TODO : implement update value
  }

  public removeControl(index: number): boolean {
    if (this.controls.length > index) {
      this.controls.splice(index, 1);
      return true;
    }
    // TODO : add logging
    return false;
  }

  public getControl(indexOrString: string | number): Form | null {
    const index = typeof indexOrString === 'number' ? indexOrString : Number(indexOrString);
    if (isNaN(index)) {
      throw new Error('Can not add control with invalid index to this form array');
    }
    if (this.controls.length > index) {
      return this.controls[ index ] as any;
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

  public addNewControl(initialValue: Partial<ItemValue>) {}

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
    this.controls.forEach(control => control.clearErrors());
  }

  public updateItem(index: number, value: ItemValue, options: Partial<SetValueOptions> = {}): void {
    const control = this.getControl(index);
    if (!control) {
      throw new Error(`Control with index '${index}' is not defined`);
    }
    control.setValue(value, options);
  }

  // @ts-ignore
  public setValue(value: Array<ItemValue> | KeyValue<ItemValue>, options: Partial<SetValueOptions> = {}): void {
    let newValue: Array<ItemValue>;
    if (!Array.isArray(value)) {
      newValue = clone(this.value || []);

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
      if ((this.value || []).length !== value.length) {
        throw new Error('Can not set value. new value length is not equal to the old value length');
      }
      newValue = value;
    }

    super.setValue(newValue, options);
    for (let controlIndex = 0; controlIndex < newValue.length; controlIndex++) {
      if (this.controls.length > controlIndex) {
        const control      = this.controls[ controlIndex ];
        const controlValue = newValue[ controlIndex ];
        control.setValue(controlValue, options);
      }
      // TODO : add logging
    }

  }

  public updateValue(
    partialValue: Array<RecursivePartial<ItemValue>>,
    options: Partial<SetValueOptions> = {}
  ): void {
    // TODO : implement
    super.updateValue(partialValue, options);
  }

  public reset() {
    this.controls.forEach(control => control.reset());
    super.reset();
  }

}
