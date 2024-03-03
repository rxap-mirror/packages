import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { AbstractControl } from '../types/abstract-control';
import { CoerceInterfaceFormTypeArray } from './coerce-form-definition-array';
import { CoerceInterfaceFormTypeControl } from './coerce-form-definition-form-control';
import { CoerceInterfaceFormTypeGroup } from './coerce-form-definition-group';
import {
  CoerceFormDefinitionClass,
  GetFormDefinitionFilePath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionTypeOptions extends TsMorphAngularProjectTransformOptions {
  controlList?: ReadonlyArray<Required<AbstractControl>>;
  name: string;
  coerceFormType?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    formTypeName: string,
    options: CoerceFormDefinitionTypeOptions,
  ) => void;
}

export function CoerceInterfaceFormType(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  { controlList }: CoerceFormDefinitionTypeOptions,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  for (const control of controlList ?? []) {
    switch (control.role) {
      case 'group':
        CoerceInterfaceFormTypeGroup(sourceFile, classDeclaration, formTypeName, control);
        break;
      case 'control':
        CoerceInterfaceFormTypeControl(sourceFile, classDeclaration, formTypeName, control);
        break;
      case 'array':
        CoerceInterfaceFormTypeArray(sourceFile, classDeclaration, formTypeName, control);
        break;
      default:
        throw new Error(`Unknown control role: ${ control.role }`);
    }
  }
}

export function CoerceFormDefinitionTypeRule(options: CoerceFormDefinitionTypeOptions) {
  let {
    coerceFormType,
  } = options;

  coerceFormType ??= CoerceInterfaceFormType;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const classDeclaration = CoerceFormDefinitionClass(sourceFile, options);
    const interfaceName = GetFormDefinitionInterfaceName(options);

    coerceFormType!(sourceFile, classDeclaration, interfaceName, options);

  }, [ GetFormDefinitionFilePath(options) ]);

}
