import { TypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
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
}

export interface NormalizedBaseFormGroup extends Readonly<Normalized<Omit<BaseFormGroup, 'role' | 'type' | 'importList' | 'controlList'>>>, NormalizedAbstractControl {
  controlList: ReadonlyArray<NormalizedControl>;
  kind: FormGroupKind.DEFAULT;
  role: AbstractControlRolls.GROUP;
}

export function NormalizeBaseFormGroup(
  group: BaseFormGroup,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false
): NormalizedBaseFormGroup {
  CoerceArrayItems(importList, [
    {
      name: 'ReactiveFormsModule',
      moduleSpecifier: '@angular/forms',
    }
  ], (a, b) => a.name === b.name);
  return {
    ...NormalizeAbstractControl(group, AbstractControlRolls.GROUP, importList, validatorList, defaultType, defaultIsArray),
    role: AbstractControlRolls.GROUP,
    controlList: NormalizeControlList(group.controlList),
    kind: FormGroupKind.DEFAULT,
  };
}
