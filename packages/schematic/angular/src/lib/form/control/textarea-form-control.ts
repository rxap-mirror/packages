import { NormalizeTypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  BaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormField,
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormFieldFormControl,
} from './form-field-form-control';

export interface TextareaAutosize {
  maxRows?: number;
  minRows?: number;
}

export type NormalizedTextareaAutosize = Readonly<Normalized<TextareaAutosize>>

export function NormalizeTextareaAutosize(
  autosize: TextareaAutosize | null | undefined,
): NormalizedTextareaAutosize | null {
  if (!autosize || Object.keys(autosize).length === 0) {
    return null;
  }
  return Object.freeze({
    maxRows: autosize.maxRows ?? null,
    minRows: autosize.minRows ?? null,
  });
}

export interface TextareaFormControl extends FormFieldFormControl {
  placeholder?: string;
  formField?: FormField;
  autosize?: TextareaAutosize;
}

export interface NormalizedTextareaFormControl
  extends Omit<Readonly<Normalized<TextareaFormControl>>, keyof NormalizedFormFieldFormControl>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.TEXTAREA;
  autosize: NormalizedTextareaAutosize | null;
}

export function IsTextareaFormControlOptions(options: BaseFormControl): options is TextareaFormControl {
  return options.kind === FormControlKinds.TEXTAREA;
}

export function IsNormalizedTextareaFormControlOptions(template: NormalizedBaseFormControl): template is NormalizedTextareaFormControl {
  return template.kind === FormControlKinds.TEXTAREA;
}

export function NormalizeTextareaFormControl(
  control: TextareaFormControl,
): NormalizedTextareaFormControl {
  const type = NormalizeTypeImport(control.type, 'string');
  const validatorList = control.validatorList ?? [];
  const importList = control.importList ?? [];
  const autosize = NormalizeTextareaAutosize(control.autosize);
  CoerceArrayItems(importList, [
    {
      name: 'MatInputModule',
      moduleSpecifier: '@angular/material/input',
    },
  ], (a, b) => a.name === b.name);
  if (autosize) {
    CoerceArrayItems(importList, [
      {
        name: 'TextFieldModule',
        moduleSpecifier: '@angular/cdk/text-field',
      }
    ], (a, b) => a.name === b.name);
  }
  // TODO : auto add validators
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, validatorList, type, false),
    autosize,
    validatorList,
    kind: FormControlKinds.TEXTAREA,
    placeholder: control.placeholder ?? null,
  });
}
