import { CoerceComponentImport } from '@rxap/ts-morph';
import { ClassDeclaration } from 'ts-morph';
import { IsNormalizedFormArray } from './array/form-array';
import { NormalizedControl } from './control';
import { IsNormalizedFormGroup } from './group/form-group';

export function CoerceControlComponentImports(classDeclaration: ClassDeclaration, controlList: ReadonlyArray<NormalizedControl>) {
  for (const control of controlList) {
    for (const componentImport of control.importList) {
      CoerceComponentImport(classDeclaration, componentImport);
    }
    if (IsNormalizedFormArray(control) || IsNormalizedFormGroup(control)) {
      CoerceControlComponentImports(classDeclaration, control.controlList);
    }
  }
}
