import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  BaseFormControlOptions,
  FormControlKinds,
  MinimalNormalizedFormControl,
  NormalizeBaseFormControlOptions,
  NormalizedBaseFormControlOptions,
  NormalizeInputFormControlOptions,
  NormalizeSelectFormControlOptions,
} from './form-control';

export interface FormDefinitionControl {
  name: string;
  type?: string | TypeImport;
  isArray?: boolean;
  state?: string;
  isRequired?: boolean;
  isReadonly?: boolean;
  isDisabled?: boolean;
  validatorList?: string[];
  importList?: TypeImport[];
  options?: BaseFormControlOptions;
}

export interface NormalizedFormDefinitionControl extends Readonly<Normalized<FormDefinitionControl>> {
  type: NormalizedTypeImport;
  options: NormalizedBaseFormControlOptions;
  importList: NormalizedTypeImport[];
}

export function NormalizeFormControlTemplate(
  minimalNormalizedControl: MinimalNormalizedFormControl,
  options?: BaseFormControlOptions,
): NormalizedBaseFormControlOptions {
  switch (options?.kind) {
    case FormControlKinds.INPUT:
      return NormalizeInputFormControlOptions(options, minimalNormalizedControl);
    case FormControlKinds.SELECT:
      return NormalizeSelectFormControlOptions(options, minimalNormalizedControl);
    case FormControlKinds.DEFAULT:
    default:
      return NormalizeBaseFormControlOptions({
        ...options,
        kind: FormControlKinds.DEFAULT,
      }, minimalNormalizedControl);
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
  const options = NormalizeFormControlTemplate({
    validatorList,
    importList,
    type,
  }, control.options);
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
    options,
  });
}

export function NormalizeFormDefinitionControlList(
  controlList?: Array<FormDefinitionControl>,
): ReadonlyArray<NormalizedFormDefinitionControl> {
  return Object.freeze(controlList?.map(NormalizeFormDefinitionControl) ?? []);
}
