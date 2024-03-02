import {
  DataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  AbstractControl,
  AbstractControlRolls,
  NormalizeAbstractControl,
  NormalizedAbstractControl,
} from '../abstract-control';

import { FormControlKinds } from './form-control-kind';

export interface BaseFormControl extends DataProperty, AbstractControl {
  state?: string;
  isRequired?: boolean;
  kind?: FormControlKinds;
  template?: string;
  label?: string;
  role: AbstractControlRolls.CONTROL;
}

export interface NormalizedBaseFormControl extends Readonly<Normalized<Omit<BaseFormControl, 'type' | 'importList' | 'kind'>>>, NormalizedDataProperty, NormalizedAbstractControl {
  importList: NormalizedTypeImport[];
  role: AbstractControlRolls.CONTROL;
}

export function NormalizeBaseFormControl(
  control: BaseFormControl,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false
): NormalizedBaseFormControl {

  const kind = control.kind ?? FormControlKinds.DEFAULT;
  return Object.freeze({
    ...NormalizeAbstractControl(control, kind, importList, validatorList, defaultType, defaultIsArray),
    role: AbstractControlRolls.CONTROL,
    kind,
    label: control.label ?? null,
  });
}
