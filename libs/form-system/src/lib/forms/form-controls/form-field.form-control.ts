import {
  BaseFormControl,
  IBaseFormControl
} from './base.form-control';
import { ErrorStateMatcher } from '@angular/material';
import { IconConfig } from '@rxap/utilities';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { Subject } from 'rxjs';

export class FormFieldControlErrorStateMatcher implements ErrorStateMatcher {

  constructor(public readonly control: FormFieldFormControl<any>) {}

  isErrorState(): boolean {
    return this.control.hasError();
  }
}

export interface IFormFieldFormControl<ControlValue> extends IBaseFormControl<ControlValue> {
  appearance: AppearanceTypes;
  prefixIcon: string | IconConfig | null;
  suffixIcon: string | IconConfig | null;
  prefixButton: string | IconConfig | null;
  suffixButton: string | IconConfig | null;
}

export enum AppearanceTypes {
  LEGACY   = 'legacy',
  STANDARD = 'standard',
  FILL     = 'fill',
  OUTLINE  = 'outline'
}

export class FormFieldFormControl<ControlValue>
  extends BaseFormControl<ControlValue> {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): FormFieldFormControl<any> {
    return new FormFieldFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<IFormFieldFormControl<ControlValue>> = {}): FormFieldFormControl<ControlValue> {
    const control       = FormFieldFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, options);
    return control;
  }

  public appearance: AppearanceTypes = AppearanceTypes.STANDARD;

  public errorStateMatcher: ErrorStateMatcher = new FormFieldControlErrorStateMatcher(this);

  public prefixIcon: string | IconConfig | null = null;
  public suffixIcon: string | IconConfig | null = null;

  public prefixButton: string | IconConfig | null = null;
  public suffixButton: string | IconConfig | null = null;

  public prefixButtonClick$ = new Subject<ControlValue>();
  public suffixButtonClick$ = new Subject<ControlValue>();

  public onPrefixButtonClick(value: ControlValue) {
    this.prefixButtonClick$.next(value);
  }

  public onSuffixButtonClick(value: ControlValue) {
    this.suffixButtonClick$.next(value);
  }

}
