import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './form/control/base-form-control';
import { NormalizeCheckboxFormControl } from './form/control/checkbox-form-control';

import { FormControlKinds } from './form/control/form-control-kind';
import { NormalizeInputFormControl } from './form/control/input-form-control';
import { NormalizeSelectFormControl } from './form/control/select-form-control';
import { NormalizeSlideToggleFormControl } from './form/control/slide-toggle-form-control';
import { NormalizeTableSelectFormControl } from './form/control/table-select-form-control';

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
    case FormControlKinds.SLIDE_TOGGLE:
      return NormalizeSlideToggleFormControl(control);
    case FormControlKinds.TABLE_SELECT:
      return NormalizeTableSelectFormControl(control);
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
