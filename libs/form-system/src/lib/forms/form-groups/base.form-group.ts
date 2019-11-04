import {
  BaseForm,
  BaseFormErrors,
  SetValueOptions
} from '../base.form';
import { ParentForm } from '../parent.form';
import { clone } from 'ramda';
import {
  Nullable,
  RecursivePartial
} from '@rxap/utilities';

export interface FormGroupError extends BaseFormErrors {
  controls: { [controlId: string]: BaseFormErrors | null };
}

export class BaseFormGroup<GroupValue extends object>
  extends BaseForm<Nullable<GroupValue>, FormGroupError, RecursivePartial<Nullable<GroupValue>>> {

  public static EMPTY(parent?: BaseForm<any, any, any>): BaseFormGroup<any> {
    return new BaseFormGroup<any>('empty', 'group', parent);
  }

  public readonly controls = new Map<string, BaseForm<GroupValue[keyof GroupValue], any, any>>();

  constructor(
    public readonly formId: string,
    public readonly controlId: string,
    public readonly formDefinition: any | null     = null,
    // TODO : add parent type
    public readonly parent: ParentForm<any> | null = null
  ) {
    super(formId, controlId, parent);
  }

  public init(): void {
    super.init();
    this.controls.forEach(control => control.init());
  }

  public addControl(control: BaseForm<GroupValue[keyof GroupValue], any, any>, controlId: string = control.controlId): void {
    if (control.parent !== this) {
      throw new Error('Can not add control if parent is not equal to this form group');
    }
    if (typeof controlId !== 'string') {
      throw new Error('Control Id must be type of string');
    }
    if (this._initialized) {
      control.init();
    }
    this.controls.set(controlId, control);
    this.updateValue({ [ controlId ]: control.value } as any, { emit: false, force: true, onlySelf: true });
  }

  public removeControl(controlId: string): boolean {
    const successful = this.controls.delete(controlId);

    if (successful) {
      const value: any = clone(this.value);
      if (!value.hasOwnProperty(controlId)) {
        throw new Error('Unexpected');
      }
      delete value[ controlId ];
      this.setValue(value, { onlySelf: true });
    }

    return successful;
  }

  public getControl<T extends BaseForm<GroupValue[keyof GroupValue], any, any> = BaseForm<GroupValue[keyof GroupValue], any, any>>(controlId: string): T | null {
    if (this.controls.has(controlId)) {
      return this.controls.get(controlId) as any;
    }
    // TODO : add logging
    return null;
  }

  public hasControl(controlId: string): boolean {
    return this.controls.has(controlId);
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

  public setValue(value: Nullable<GroupValue>, options: Partial<SetValueOptions> = {}): void {
    if (!options.onlySelf) {
      for (const [ controlId, controlValue ] of Object.entries(value)) {
        if (this.controls.has(controlId)) {
          // tslint:disable-next-line:no-non-null-assertion
          const control = this.controls.get(controlId)!;
          control.setValue(controlValue as any, { ...options, skipParent: true });
        }
        // TODO : add logging
      }
    }
    super.setValue(value, { ...options, onlySelf: true });
  }

  public updateValue(partialValue: RecursivePartial<Nullable<GroupValue>>, options: Partial<SetValueOptions> = {}): void {
    if (!options.onlySelf) {
      for (const [ controlId, controlValue ] of Object.entries(partialValue)) {
        if (this.controls.has(controlId)) {
          // tslint:disable-next-line:no-non-null-assertion
          const control = this.controls.get(controlId)!;
          control.updateValue(controlValue as any, { ...options, skipParent: true });
        }
        // TODO : add logging
      }
    }
    super.updateValue(partialValue, { ...options, onlySelf: true });
  }

}
