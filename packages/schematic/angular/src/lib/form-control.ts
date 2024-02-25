import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  ControlOption,
  DeleteEmptyProperties,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import { BackendTypes } from './backend-types';
import { LoadHandlebarsTemplate } from './load-handlebars-template';

// region BaseFormControlOptions

export enum FormControlKinds {
  DEFAULT = 'default',
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
}

export interface BaseFormControl {
  name: string;
  type?: string | TypeImport;
  isArray?: boolean;
  state?: string;
  isRequired?: boolean;
  isReadonly?: boolean;
  isDisabled?: boolean;
  validatorList?: string[];
  importList?: TypeImport[];
  kind: FormControlKinds;
  template?: string;
  label?: string;
}

export interface NormalizedBaseFormControl extends Readonly<Normalized<BaseFormControl>> {
  type: NormalizedTypeImport;
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ control: NormalizedBaseFormControl }>,
}

export function NormalizeBaseFormControl(
  control: BaseFormControl,
): NormalizedBaseFormControl {
  const name: string = control.name;
  const type: NormalizedTypeImport = NormalizeTypeImport(control.type);
  const state: string | null = control.state ?? null;
  const isRequired: boolean = control.isRequired ?? false;
  const validatorList: string[] = control.validatorList ?? [];
  const importList = (control.importList ?? []);
  const isReadonly: boolean = control.isReadonly ?? false;
  const isDisabled: boolean = control.isDisabled ?? false;
  let isArray = false;
  if (type.name.endsWith('[]')) {
    isArray = true;
    type.name = type.name.slice(0, -2);
  }
  if (type.name.startsWith('Array<') && type.name.endsWith('>')) {
    isArray = true;
    type.name = type.name.slice(6, -1);
  }
  const kind = control.kind ?? FormControlKinds.DEFAULT;
  const template = control.template ?? kind + '-form-control.hbs';
  return Object.freeze({
    name,
    type,
    isArray,
    isRequired,
    state,
    isReadonly,
    isDisabled,
    validatorList,
    importList: importList.map(NormalizeTypeImport),
    kind,
    template,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'form', 'templates')),
    label: control.label ?? null,
  });
}

// endregion

// region FormFiled

export interface FormFieldButton {
  svgIcon?: string;
  icon?: string;
  directiveList?: TypeImport[];
  importList?: TypeImport[];
}

export interface FormField {
  label?: string;
  prefixButton?: FormFieldButton;
  suffixButton?: FormFieldButton;
  hasClearButton?: boolean;
}

export type NormalizedFormField = Readonly<Normalized<FormField>>;

export interface NormalizedFormFieldButton extends Readonly<Normalized<FormFieldButton>> {
  directiveList: NormalizedTypeImport[];
  importList: NormalizedTypeImport[];
}

export function NormalizeFormFieldButton(
  button?: FormFieldButton | null,
): NormalizedFormFieldButton | null {
  if ((
    !button || Object.keys(button).length === 0
  )) {
    return null;
  }
  const importList = button.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatIconModule',
      moduleSpecifier: '@angular/material/icon',
    },
    {
      name: 'MatButtonModule',
      moduleSpecifier: '@angular/material/button',
    }
  ], (a, b) => a.name === b.name);
  return Object.freeze({
    svgIcon: button.svgIcon ?? null,
    icon: button.icon ?? null,
    directiveList: NormalizeTypeImportList(button.directiveList),
    importList: NormalizeTypeImportList(importList),
  });
}

export function NormalizeFormField(
  formField: FormField,
  defaultFormField: Partial<FormField> = {},
): NormalizedFormField {
  defaultFormField = DeleteEmptyProperties(defaultFormField);
  const normalizedFormField = {
    label: defaultFormField.label ?? formField.label ?? null,
    prefixButton: NormalizeFormFieldButton(formField.prefixButton ?? defaultFormField.prefixButton),
    suffixButton: NormalizeFormFieldButton(formField.suffixButton ?? defaultFormField.suffixButton),
    hasClearButton: formField.hasClearButton ?? defaultFormField.hasClearButton ?? true,
  };
  if (normalizedFormField.hasClearButton) {
    normalizedFormField.suffixButton ??= NormalizeFormFieldButton({
      icon: 'clear',
      directiveList: [
        {
          name: 'rxapInputClearButton',
          namedImport: 'InputClearButtonDirective',
          moduleSpecifier: '@rxap/material-form-system',
        },
      ],
    });
  }
  return Object.freeze(normalizedFormField);
}

// endregion

// region InputFormControlOptions

export interface InputFormControl extends BaseFormControl {
  inputType?: string;
  placeholder?: string;
  formField?: FormField;
}

export interface NormalizedInputFormControl extends Omit<Readonly<Normalized<InputFormControl>>, 'type' | 'importList'>,
                                                    NormalizedBaseFormControl {
  kind: FormControlKinds.INPUT;
}

export function IsNormalizedInputFormControlOptions(template: NormalizedBaseFormControl): template is NormalizedInputFormControl {
  return template.kind === FormControlKinds.INPUT;
}

export function NormalizeInputFormControl(
  control: InputFormControl,
): NormalizedInputFormControl {
  const type = NormalizeTypeImport(control.type);
  const validatorList = control.validatorList ?? [];
  const importList = control.importList ?? [];
  importList.push({
    name: 'MatInputModule',
    moduleSpecifier: '@angular/material/input',
  });
  const inputType: string = control.inputType ?? 'text';
  switch (inputType) {
    case 'checkbox':
      type.name = 'boolean';
      break;
    case 'text':
    case 'password':
    case 'color':
      type.name = 'string';
      break;
    case 'email':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsEmail()' ]);
      break;
    case 'tel':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsTel()' ]);
      break;
    case 'url':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsUrl()' ]);
      break;
    case 'number':
      type.name = 'number';
      break;
    case 'date':
    case 'time':
    case 'datetime-local':
      type.name = 'Date';
      CoerceArrayItems(validatorList, [ 'IsDate()' ]);
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
      throw new Error(`The input type "${ inputType }" is not yet supported`);
  }
  const formField = NormalizeFormField(control.formField ?? {}, { label: control.label });
  importList.push(...formField?.prefixButton?.directiveList ?? []);
  importList.push(...formField?.suffixButton?.directiveList ?? []);
  importList.push(...formField?.prefixButton?.importList ?? []);
  importList.push(...formField?.suffixButton?.importList ?? []);
  // TODO : auto add validators
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    type,
    validatorList,
    importList: NormalizeTypeImportList(importList),
    kind: FormControlKinds.INPUT,
    inputType,
    placeholder: control.placeholder ?? null,
    formField,
  });
}

// endregion

// region SelectFormControl

export interface SelectFormControl extends BaseFormControl {
  options?: ControlOption[];
  backend?: BackendTypes;
  multiple?: boolean;
  formField?: FormField;
}

export interface NormalizedSelectFormControl
  extends Readonly<Normalized<Omit<SelectFormControl, 'options' | 'type' | 'importList'>>>, NormalizedBaseFormControl {
  kind: FormControlKinds.SELECT;
  options: ReadonlyArray<ControlOption> | null;
  backend: BackendTypes;
}

export function IsNormalizedSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedSelectFormControl {
  return template.kind === FormControlKinds.SELECT;
}

export function NormalizeSelectFormControl(
  control: SelectFormControl,
): NormalizedSelectFormControl {
  const importList = control.importList ?? [];
  importList.push({
    name: 'MatSelectModule',
    moduleSpecifier: '@angular/material/select',
  });
  const formField = NormalizeFormField(control.formField ?? {}, { label: control.label });
  importList.push(...formField?.prefixButton?.directiveList ?? []);
  importList.push(...formField?.suffixButton?.directiveList ?? []);
  importList.push(...formField?.prefixButton?.importList ?? []);
  importList.push(...formField?.suffixButton?.importList ?? []);
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    importList: NormalizeTypeImportList(importList),
    kind: FormControlKinds.SELECT,
    formField,
    options: control.options && control.options.length ? Object.freeze(control.options) : null,
    backend: control.backend ?? BackendTypes.NONE,
    multiple: control.multiple ?? false,
  });
}

// endregion

// region CheckboxFormControl

export interface CheckboxFormControl extends BaseFormControl {
  labelPosition?: 'before' | 'after'
}

export interface NormalizedCheckboxFormControl extends Readonly<Normalized<Omit<CheckboxFormControl, 'type' | 'importList'>>>, NormalizedBaseFormControl {
  kind: FormControlKinds.CHECKBOX;
}

export function IsNormalizedCheckboxFormControl(template: NormalizedBaseFormControl): template is NormalizedCheckboxFormControl {
  return template.kind === FormControlKinds.CHECKBOX;
}

export function NormalizeCheckboxFormControl(
  control: CheckboxFormControl,
): NormalizedCheckboxFormControl {
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    kind: FormControlKinds.CHECKBOX,
    labelPosition: control.labelPosition ?? 'after',
  });
}

// endregion
