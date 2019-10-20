import { BaseFormControl } from './base.form-control';
import { ErrorStateMatcher } from '@angular/material';
import { IconConfig } from '@rxap/utilities';

export class FormFieldControlErrorStateMatcher implements ErrorStateMatcher {

  constructor(public readonly control: FormFieldFormControl<any>) {}

  isErrorState(): boolean {
    return this.control.hasError();
  }
}

export enum AppearanceTypes {
  LEGACY   = 'legacy',
  STANDARD = 'standard',
  FILL     = 'fill',
  OUTLINE  = 'outline'
}

export class FormFieldFormControl<ControlValue>
  extends BaseFormControl<ControlValue> {

  public appearance: AppearanceTypes = AppearanceTypes.STANDARD;

  public errorStateMatcher: ErrorStateMatcher = new FormFieldControlErrorStateMatcher(this);

  public prefixIcon: string | IconConfig | null = null;
  public suffixIcon: string | IconConfig | null = null;

  public prefixButton: string | IconConfig | null = null;
  public suffixButton: string | IconConfig | null = null;

  public onPrefixButtonClick() {}

  public onSuffixButtonClick() {}

}
