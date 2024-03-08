import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';

export interface SlideToggleFormControl extends BaseFormControl {
  labelPosition?: 'before' | 'after';
}

export interface NormalizedSlideToggleFormControl
  extends Readonly<Normalized<Omit<SlideToggleFormControl, keyof NormalizedBaseFormControl>>>, NormalizedBaseFormControl {
  kind: FormControlKinds.CHECKBOX;
}

export function IsNormalizedSlideToggleFormControl(template: NormalizedBaseFormControl): template is NormalizedSlideToggleFormControl {
  return template.kind === FormControlKinds.CHECKBOX;
}

export function NormalizeSlideToggleFormControl(
  control: SlideToggleFormControl,
): NormalizedSlideToggleFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatSlideToggleModule',
      moduleSpecifier: '@angular/material/slide-toggle',
    },
  ], (a, b) => a.name === b.name);
  return Object.freeze({
    ...NormalizeBaseFormControl(control, importList, undefined, 'boolean', false),
    kind: FormControlKinds.CHECKBOX,
    labelPosition: control.labelPosition ?? 'after',
  });
}
