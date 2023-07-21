import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { FormDefinitionControl } from '../types/form-definition-control';
import { CoerceInterfaceFormTypeControl } from './coerce-form-definition-control';
import {
  CoerceFormDefinitionClass,
  GetFormDefinitionFilePath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionTypeOptions extends TsMorphAngularProjectTransformOptions {
  controlList?: Array<Required<FormDefinitionControl>>;
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
    CoerceInterfaceFormTypeControl(sourceFile, classDeclaration, formTypeName, control);
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
