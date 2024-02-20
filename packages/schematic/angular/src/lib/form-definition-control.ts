import { TypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from './backend-types';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
} from '@rxap/ts-morph';

export enum FormControlTemplateType {
  DEFAULT = 'default',
  INPUT = 'input',
  SELECT = 'select',
}

export interface BaseFormControlTemplate {
  name: FormControlTemplateType;
}

export type MinimalNormalizedFormDefinitionControl = Pick<NormalizedFormDefinitionControl, 'validatorList' | 'type'>

// region InputFormControlTemplate

export interface InputFormControlTemplate extends BaseFormControlTemplate {
  type?: string;
  placeholder?: string;
  label?: string;
}

export interface NormalizedInputFormControlTemplate extends Readonly<Normalized<InputFormControlTemplate>>,
                                                            BaseFormControlTemplate {
  name: FormControlTemplateType.INPUT;
}

export function IsNormalizedInputFormControlTemplate(template: BaseFormControlTemplate): template is NormalizedInputFormControlTemplate {
  return template.name === FormControlTemplateType.INPUT;
}

export function NormalizeInputFormControlTemplate(
  template: InputFormControlTemplate,
  normalizedControl: MinimalNormalizedFormDefinitionControl,
): NormalizedInputFormControlTemplate {
  const type: string = template.type ?? 'text';
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
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsEmail' ]);
      break;
    case 'tel':
      normalizedControl.type.name = 'string';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsTel' ]);
      break;
    case 'url':
      normalizedControl.type.name = 'string';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsUrl' ]);
      break;
    case 'number':
      normalizedControl.type.name = 'number';
      break;
    case 'date':
    case 'time':
    case 'datetime-local':
      normalizedControl.type.name = 'Date';
      CoerceArrayItems(normalizedControl.validatorList, [ 'IsDate' ]);
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
      throw new Error(`The input type "${type}" is not yet supported`);
  }
  // TODO : auto add validators
  return Object.freeze({
    name: FormControlTemplateType.INPUT,
    type,
    placeholder: template.placeholder ?? null,
    label: template.label ?? null,
  });
}

// endregion

// region SelectFormControlTemplate

export interface SelectFormControlTemplate extends BaseFormControlTemplate {
  label?: string;
  options?: ControlOption[];
  backend?: BackendTypes;
}

export interface NormalizedSelectFormControlTemplate
  extends Readonly<Normalized<Omit<SelectFormControlTemplate, 'options'>>>, BaseFormControlTemplate {
  name: FormControlTemplateType.SELECT;
  options: ReadonlyArray<ControlOption> | null;
  backend: BackendTypes;
}

export function IsNormalizedSelectFormControlTemplate(template: BaseFormControlTemplate): template is NormalizedSelectFormControlTemplate {
  return template.name === FormControlTemplateType.SELECT;
}

export function NormalizeSelectFormControlTemplate(template: SelectFormControlTemplate): NormalizedSelectFormControlTemplate {
  return Object.freeze({
    name: FormControlTemplateType.SELECT,
    label: template.label ?? null,
    options: template.options ? Object.freeze(template.options) : null,
    backend: template.backend ?? BackendTypes.LOCAL,
  });
}

// endregion

export interface FormDefinitionControl {
  name: string;
  type?: string | TypeImport;
  isArray?: boolean;
  state?: string;
  isRequired?: boolean;
  isReadonly?: boolean;
  isDisabled?: boolean;
  validatorList?: string[];
  template?: BaseFormControlTemplate;
}

export interface NormalizedFormDefinitionControl extends Readonly<Normalized<FormDefinitionControl>> {
  type: NormalizedTypeImport;
  template: BaseFormControlTemplate;
}

export function NormalizeFormControlTemplate(
  minimalNormalizedControl: MinimalNormalizedFormDefinitionControl,
  template?: BaseFormControlTemplate,
): BaseFormControlTemplate {
  if (!template) {
    return Object.freeze({
      name: FormControlTemplateType.DEFAULT,
    });
  }
  switch (template.name) {
    case FormControlTemplateType.INPUT:
      return NormalizeInputFormControlTemplate(template, minimalNormalizedControl);
    case FormControlTemplateType.SELECT:
      return NormalizeSelectFormControlTemplate(template);
    case FormControlTemplateType.DEFAULT:
    default:
      return Object.freeze({
        name: FormControlTemplateType.DEFAULT,
      });
  }
}

export function NormalizeFormDefinitionControl(
  control: FormDefinitionControl,
): NormalizedFormDefinitionControl {
  const name: string = control.name;
  const type: NormalizedTypeImport = NormalizeTypeImport(control.type);
  const state: string | null = control.state ?? null;
  const isRequired: boolean = control.isRequired ?? false;
  const validatorList: string[] = control.validatorList ?? [];
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
  return Object.freeze({
    name,
    type,
    isArray,
    isRequired,
    state,
    isReadonly,
    isDisabled,
    validatorList,
    template: NormalizeFormControlTemplate({
      validatorList,
      type,
    }, control.template),
  });
}

export function NormalizeFormDefinitionControlList(
  controlList?: Array<FormDefinitionControl>,
): ReadonlyArray<NormalizedFormDefinitionControl> {
  return Object.freeze(controlList?.map(NormalizeFormDefinitionControl) ?? []);
}
