import {
  BaseForm,
  BaseFormErrors
} from '../base.form';
import { mergeDeepRight } from 'ramda';
import { RxapFormDefinition } from '../../form-definition/form-definition';
import { ParentForm } from '../parent.form';

export interface FormGroupError extends BaseFormErrors {
  controls: { [controlId: string]: BaseFormErrors | null };
}

export class BaseFormGroup<GroupValue extends object> extends BaseForm<GroupValue, FormGroupError> {

  public readonly controls = new Map<string, BaseForm<GroupValue[keyof GroupValue]>>();

  constructor(
    public readonly formId: string,
    public readonly controlId: string,
    public readonly formDefinition: RxapFormDefinition<any>,
    // TODO : add parent type
    public readonly parent: ParentForm<any> | null = null
  ) {
    super(formId, controlId, parent);
  }

  public addControl(control: BaseForm<GroupValue[keyof GroupValue]>, controlId: string): void {
    if (control.parent !== this) {
      throw new Error('Can not add control if parent is not equal to this form group');
    }
    this.controls.set(controlId, control);
  }

  public removeControl(controlId: string): boolean {
    return this.controls.delete(controlId);
  }

  public getControl<T extends BaseForm<GroupValue> = BaseForm<GroupValue>>(controlId: string): T | null {
    if (this.controls.has(controlId)) {
      return this.controls.get(controlId) as any;
    }
    // TODO : add logging
    return null;
  }

  public hasControl(controlId: string): boolean {
    return this.controls.has(controlId);
  }

  public init(): void {
    super.init();
    Array.from(this.controls.values()).forEach(control => control.init());
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

  public setValue(value: Partial<GroupValue>): void {
    const newValue: GroupValue = mergeDeepRight<GroupValue, Partial<GroupValue>>(this.value, value) as any;
    for (const [ controlId, controlValue ] of Object.entries(value)) {
      if (this.controls.has(controlId)) {
        // tslint:disable-next-line:no-non-null-assertion
        const control = this.controls.get(controlId)!;
        control.setValue(controlValue as any);
      }
      // TODO : add logging
    }
    super.setValue(newValue);
  }

}
