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
import { FormArrayKind } from './form-array-kind';

export interface BaseFormArray extends AbstractControl {
  controlList?: Control[];
  kind?: FormArrayKind;
  role: AbstractControlRolls.ARRAY;
}

export interface NormalizedBaseFormArray extends Readonly<Normalized<Omit<BaseFormArray, 'role' | 'type' | 'importList' | 'controlList'>>>, NormalizedAbstractControl {
  controlList: ReadonlyArray<NormalizedControl>;
  kind: FormArrayKind.DEFAULT;
  role: AbstractControlRolls.ARRAY;
}

export function NormalizeBaseFormArray(
  array: BaseFormArray,
  importList: TypeImport[] = [],
  validatorList: string[] = [],
  defaultType: TypeImport | string = 'unknown',
  defaultIsArray = false
): NormalizedBaseFormArray {
  CoerceArrayItems(importList, [
    {
      name: 'ReactiveFormsModule',
      moduleSpecifier: '@angular/forms',
    }
  ], (a, b) => a.name === b.name);
  return {
    ...NormalizeAbstractControl(array, AbstractControlRolls.ARRAY, importList, validatorList, defaultType, defaultIsArray),
    role: AbstractControlRolls.ARRAY,
    controlList: NormalizeControlList(array.controlList),
    kind: FormArrayKind.DEFAULT,
  };
}
