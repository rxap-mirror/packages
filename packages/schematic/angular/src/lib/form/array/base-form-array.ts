import { TypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  AbstractControl,
  AbstractControlRolls,
  AbstractControlToDataProperty,
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
  legend?: string;
  groupLegend?: string;
}

export interface NormalizedBaseFormArray extends Readonly<Normalized<Omit<BaseFormArray, keyof NormalizedAbstractControl | 'controlList'>>>, NormalizedAbstractControl {
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
    },
    {
      name: 'ForFormArrayItemsDirective',
      moduleSpecifier: '@rxap/form-system',
    },
    {
      name: 'FormArrayRemovableDirective',
      moduleSpecifier: '@rxap/form-system',
    },
    {
      name: 'FormArrayItemRemoveButtonDirective',
      moduleSpecifier: '@rxap/form-system',
    },
    {
      name: 'FormArrayItemRestoreButtonDirective',
      moduleSpecifier: '@rxap/form-system',
    },
    {
      name: 'FormArrayAddItemButtonDirective',
      moduleSpecifier: '@rxap/form-system',
    },
  ], (a, b) => a.name === b.name);
  const kind = array.kind ?? FormArrayKind.DEFAULT;
  const controlList = NormalizeControlList(array.controlList);
  return {
    ...NormalizeAbstractControl(array, kind, importList, validatorList, defaultType, defaultIsArray),
    role: AbstractControlRolls.ARRAY,
    controlList,
    isArray: true,
    memberList: controlList.map(control => AbstractControlToDataProperty(control)),
    legend: array.legend ?? null,
    groupLegend: array.groupLegend ?? null,
  };
}
