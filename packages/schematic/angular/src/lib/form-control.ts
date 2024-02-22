import { TypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from './backend-types';

// region BaseFormControlOptions

export enum FormControlKinds {
  DEFAULT = 'default',
  INPUT = 'input',
  SELECT = 'select',
}

export interface BaseFormControlOptions {
  kind: FormControlKinds;
  template?: string;
}

export type NormalizedBaseFormControlOptions = Readonly<Normalized<BaseFormControlOptions>>;

export function NormalizeBaseFormControlOptions(
  options: BaseFormControlOptions,
  normalizedControl: MinimalNormalizedFormControl,
): NormalizedBaseFormControlOptions {
  return Object.freeze({
    kind: options.kind,
    template: options.template ?? null,
  });
}

// endregion

export interface MinimalNormalizedFormControl {
  type: TypeImport;
  validatorList: string[];
  importList: TypeImport[];
}

// region InputFormControlOptions

export interface InputFormControlOptions extends BaseFormControlOptions {
  type?: string;
  placeholder?: string;
  label?: string;
}

export interface NormalizedInputFormControlOptions extends Readonly<Normalized<InputFormControlOptions>>,
                                                           NormalizedBaseFormControlOptions {
  kind: FormControlKinds.INPUT;
}

export function IsNormalizedInputFormControlOptions(template: NormalizedBaseFormControlOptions): template is NormalizedInputFormControlOptions {
  return template.kind === FormControlKinds.INPUT;
}

export function NormalizeInputFormControlOptions(
  options: InputFormControlOptions,
  normalizedControl: MinimalNormalizedFormControl,
): NormalizedInputFormControlOptions {
  normalizedControl.importList.push({
    name: 'MatInputModule',
    moduleSpecifier: '@angular/material/input',
  });
  const type: string = options.type ?? 'text';
  switch (type) {
    case 'checkbox':
      normalizedControl.type.name = 'boolean';
      break;
    case 'text':
    case 'password':
    case 'color':
      normalizedControl.type.name = 'string';
      break;
    case 'email':
      normalizedControl.type.name = 'string';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsEmail()' ]);
      break;
    case 'tel':
      normalizedControl.type.name = 'string';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsTel()' ]);
      break;
    case 'url':
      normalizedControl.type.name = 'string';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsUrl()' ]);
      break;
    case 'number':
      normalizedControl.type.name = 'number';
      break;
    case 'date':
    case 'time':
    case 'datetime-local':
      normalizedControl.type.name = 'Date';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsDate()' ]);
      break;
    case 'file':
    case 'hidden':
    case 'image':
    case 'month':
    case 'radio':
    case 'reset':
    case 'button':
    case 'search':
    case 'submit':
    case 'week':
    case 'range':
      throw new Error(`The input type "${ type }" is not yet supported`);
  }
  // TODO : auto add validators
  return Object.freeze({
    ...NormalizeBaseFormControlOptions(options, normalizedControl),
    kind: FormControlKinds.INPUT,
    type,
    placeholder: options.placeholder ?? null,
    label: options.label ?? null,
  });
}

// endregion

// region SelectFormControlOptions

export interface SelectFormControlOptions extends BaseFormControlOptions {
  label?: string;
  options?: ControlOption[];
  backend?: BackendTypes;
}

export interface NormalizedSelectFormControlOptions
  extends Readonly<Normalized<Omit<SelectFormControlOptions, 'options'>>>, NormalizedBaseFormControlOptions {
  kind: FormControlKinds.SELECT;
  options: ReadonlyArray<ControlOption> | null;
  backend: BackendTypes;
}

export function IsNormalizedSelectFormControlOptions(template: NormalizedBaseFormControlOptions): template is NormalizedSelectFormControlOptions {
  return template.kind === FormControlKinds.SELECT;
}

export function NormalizeSelectFormControlOptions(
  options: SelectFormControlOptions,
  normalizedControl: MinimalNormalizedFormControl,
): NormalizedSelectFormControlOptions {
  normalizedControl.importList.push({
    name: 'MatSelectModule',
    moduleSpecifier: '@angular/material/select',
  });
  return Object.freeze({
    ...NormalizeBaseFormControlOptions(options, normalizedControl),
    kind: FormControlKinds.SELECT,
    label: options.label ?? null,
    options: options.options ? Object.freeze(options.options) : null,
    backend: options.backend ?? BackendTypes.LOCAL,
  });
}

// endregion
