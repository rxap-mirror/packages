import {
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  DeleteEmptyProperties,
  Normalized,
} from '@rxap/utilities';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';
import {
  FormControl,
  NormalizedFormControl,
} from './form-control';

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
    },
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
    normalizedFormField.prefixButton?.directiveList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
  CoerceArrayItems(
    importList,
    normalizedFormField.suffixButton?.directiveList ?? [],
    (a, b) => a.name === b.name && a.namedImport === b.namedImport,
  );
  return Object.freeze(normalizedFormField);
}

export interface FormFieldFormControl extends BaseFormControl {
  formField?: FormField;
}

export interface NormalizedFormFieldFormControl
  extends Readonly<Normalized<Omit<FormFieldFormControl, 'type' | 'importList' | 'role' | 'kind'>>>, NormalizedBaseFormControl {
  formField: NormalizedFormField;
}

export function IsFormFieldFormControl(control: FormControl): control is FormFieldFormControl {
  return (
           control as any
         ).formField !== undefined;
}

export function IsNormalizedFormFieldFormControl(control: NormalizedFormControl): control is NormalizedFormFieldFormControl {
  return (
           control as any
         ).formField !== undefined;
}

export function NormalizeFormFieldFormControl(
  control: FormFieldFormControl,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false,
  defaultFormField: Partial<FormField> = { label: control.label },
): NormalizedFormFieldFormControl {
  const formField = NormalizeFormField(control.formField ?? {}, importList, defaultFormField);
  return Object.freeze({
    ...NormalizeBaseFormControl(control, importList, validatorList, defaultType, defaultIsArray),
    formField,
  });
}
