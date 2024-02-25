import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  capitalize,
  CoerceArrayItems,
  ControlOption,
  dasherize,
  DeleteEmptyProperties,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import { BackendTypes } from './backend-types';
import { LoadHandlebarsTemplate } from './load-handlebars-template';
import {
  NormalizedTableColumn,
  NormalizeTableColumn,
  TableColumn,
  TableColumnKind,
} from './table-column';

// region BaseFormControlOptions

export enum FormControlKinds {
  DEFAULT = 'default',
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  SLIDE_TOGGLE = 'slide-toggle',
  TABLE_SELECT = 'table-select',
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
  directiveList?: TypeImport[];
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
  importList: TypeImport[] = [],
  defaultFormField: Partial<FormField> = {},
): NormalizedFormField {
  defaultFormField = DeleteEmptyProperties(defaultFormField);
  const directiveList = defaultFormField.directiveList ?? [];
  CoerceArrayItems(directiveList, defaultFormField.directiveList ?? [], (a, b) => a.name === b.name);
  const normalizedFormField = {
    label: defaultFormField.label ?? formField.label ?? null,
    prefixButton: NormalizeFormFieldButton(formField.prefixButton ?? defaultFormField.prefixButton),
    suffixButton: NormalizeFormFieldButton(formField.suffixButton ?? defaultFormField.suffixButton),
    hasClearButton: formField.hasClearButton ?? defaultFormField.hasClearButton ?? true,
    directiveList: NormalizeTypeImportList(directiveList),
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
  CoerceArrayItems(
    importList,
    normalizedFormField.prefixButton?.importList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
  CoerceArrayItems(
    importList,
    normalizedFormField.suffixButton?.importList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
  CoerceArrayItems(
    importList,
    normalizedFormField.prefixButton?.importList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
  CoerceArrayItems(
    importList,
    normalizedFormField.suffixButton?.importList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
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
  const formField = NormalizeFormField(control.formField ?? {}, importList, { label: control.label });
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
  const formField = NormalizeFormField(control.formField ?? {}, importList, { label: control.label });
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

// region SlideToggleFormControl

export interface SlideToggleFormControl extends BaseFormControl {
  labelPosition?: 'before' | 'after'
}

export interface NormalizedSlideToggleFormControl extends Readonly<Normalized<Omit<SlideToggleFormControl, 'type' | 'importList'>>>, NormalizedBaseFormControl {
  kind: FormControlKinds.CHECKBOX;
}

export function IsNormalizedSlideToggleFormControl(template: NormalizedBaseFormControl): template is NormalizedSlideToggleFormControl {
  return template.kind === FormControlKinds.CHECKBOX;
}

export function NormalizeSlideToggleFormControl(
  control: SlideToggleFormControl,
): NormalizedSlideToggleFormControl {
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    kind: FormControlKinds.CHECKBOX,
    labelPosition: control.labelPosition ?? 'after',
  });
}

// endregion

// region TableSelectFormControl

// region TableSelectColumn

export interface TableSelectColumn {
  name: string;
  label?: string;
  hasFilter?: boolean;
  kind?: TableColumnKind;
}

export type NormalizedTableSelectColumn = Readonly<Normalized<TableSelectColumn>>;

export function NormalizeTableSelectColumn(
  column: TableSelectColumn,
): NormalizedTableSelectColumn {
  return Object.freeze({
    name: column.name,
    label: column.label ?? dasherize(column.name).split('-').map(part => capitalize(part)).join(' '),
    hasFilter: column.hasFilter ?? false,
    kind: column.kind ?? TableColumnKind.DEFAULT,
  });
}

// endregion

// region ToFunction
export interface TableSelectToFunction {
  property: DataProperty;
}

export interface NormalizedTableSelectToFunction extends Readonly<Normalized<TableSelectToFunction>> {
  property: NormalizedDataProperty;
}

export function NormalizeTableSelectToFunction(
  toFunction: TableSelectToFunction | null | undefined,
  columnList: TableSelectColumn[],
): NormalizedTableSelectToFunction {
  if (!toFunction || Object.keys(toFunction).length === 0) {
    return Object.freeze({
      property: NormalizeDataProperty(columnList[0].name),
    });
  }
  return Object.freeze({
    property: NormalizeDataProperty(toFunction.property),
  });
}

// endregion

export interface TableSelectFormControl extends BaseFormControl {
  backend?: BackendTypes;
  formField?: FormField;
  title?: string;
  columnList?: TableColumn[];
  toDisplay?: TableSelectToFunction;
  toValue?: TableSelectToFunction;
}

export interface NormalizedTableSelectFormControl
  extends Readonly<Normalized<Omit<TableSelectFormControl, 'type' | 'importList' | 'columnList'>>>,
          NormalizedBaseFormControl {
  kind: FormControlKinds.TABLE_SELECT;
  backend: BackendTypes;
  columnList: NormalizedTableSelectColumn[];
  toDisplay: NormalizedTableSelectToFunction;
  toValue: NormalizedTableSelectToFunction;
}

export function IsNormalizedTableSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedTableSelectFormControl {
  return template.kind === FormControlKinds.TABLE_SELECT;
}

export function NormalizeTableSelectFormControl(
  control: TableSelectFormControl,
): NormalizedTableSelectFormControl {
  const importList = control.importList ?? [];
  importList.push({
    name: 'TableSelectControlModule',
    moduleSpecifier: '@digitaix/eurogard-table-select',
  });
  if (!control.columnList?.length) {
    throw new Error('The column list must not be empty');
  }
  const formField = NormalizeFormField(
    control.formField ?? {},
    importList,
    {
      label: control.label,
      directiveList: [
        {
          name: 'eurogardTableSelectControl',
          namedImport: 'TableSelectControlModule',
          moduleSpecifier: '@digitaix/eurogard-table-select',
        },
      ]
    },
  );
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    importList: NormalizeTypeImportList(importList),
    kind: FormControlKinds.TABLE_SELECT,
    formField,
    backend: control.backend ?? BackendTypes.NONE,
    title: control.title ?? null,
    columnList: control.columnList.map(NormalizeTableSelectColumn),
    toDisplay: NormalizeTableSelectToFunction(control.toDisplay, control.columnList),
    toValue: NormalizeTableSelectToFunction(control.toValue, control.columnList),
  });
}

// endregion