import {
  BaseFormControl,
  FormControlKinds,
  NormalizeBaseFormControl,
  NormalizeCheckboxFormControl,
  NormalizedBaseFormControl,
  NormalizeInputFormControl,
  NormalizeSelectFormControl,
} from './form-control';

export type FormDefinitionControl = BaseFormControl

export type NormalizedFormDefinitionControl = NormalizedBaseFormControl

export function NormalizeFormDefinitionControl(
  control: FormDefinitionControl,
): NormalizedFormDefinitionControl {
  const kind = control.kind ?? FormControlKinds.DEFAULT;
  switch (kind) {
    case FormControlKinds.INPUT:
      return NormalizeInputFormControl(control);
    case FormControlKinds.SELECT:
      return NormalizeSelectFormControl(control);
    case FormControlKinds.CHECKBOX:
      return NormalizeCheckboxFormControl(control);
    case FormControlKinds.DEFAULT:
    default:
      return NormalizeBaseFormControl(control);
  }
}

export function NormalizeFormDefinitionControlList(
  controlList?: Array<FormDefinitionControl>,
): ReadonlyArray<NormalizedFormDefinitionControl> {
  return Object.freeze(controlList?.map(NormalizeFormDefinitionControl) ?? []);
}
