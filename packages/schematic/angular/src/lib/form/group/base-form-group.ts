import { TypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
import {
  AbstractControl,
  AbstractControlRolls,
  NormalizeAbstractControl,
  NormalizedAbstractControl,
} from '../abstract-control';
import {
  Control,
  NormalizeControlList,
  NormalizedControl,
} from '../control';
import { FormGroupKind } from './form-group-kind';

export interface BaseFormGroup extends AbstractControl {
  controlList?: Control[];
  kind?: FormGroupKind;
  role: AbstractControlRolls.GROUP;
  legend?: string;
}

export interface NormalizedBaseFormGroup extends Readonly<Normalized<Omit<BaseFormGroup, keyof NormalizedAbstractControl | 'controlList'>>>, NormalizedAbstractControl {
  controlList: ReadonlyArray<NormalizedControl>;
  kind: FormGroupKind.DEFAULT;
  role: AbstractControlRolls.GROUP;
}

export function NormalizeBaseFormGroup(
  group: BaseFormGroup,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false,
  backend: BackendOptions,
): NormalizedBaseFormGroup {
  CoerceArrayItems(importList, [
    {
      name: 'ReactiveFormsModule',
      moduleSpecifier: '@angular/forms',
    }
  ], (a, b) => a.name === b.name);
  const kind = group.kind ?? FormGroupKind.DEFAULT;
  return {
    ...NormalizeAbstractControl(group, kind, importList, validatorList, defaultType, defaultIsArray, backend),
    role: AbstractControlRolls.GROUP,
    controlList: NormalizeControlList(group.controlList, backend),
    legend: group.legend ?? null,
  };
}
