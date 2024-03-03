import { Rule } from '@angular-devkit/schematics';
import { camelize } from '@rxap/schematics-utilities';
import {
  CoerceDecorator,
  CoerceImports,
  CoercePropertyDeclaration,
  WriteType,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { AbstractControl } from '../types/abstract-control';
import {
  CoerceFormDefinitionControl,
  CoerceFormDefinitionControlOptions,
  FormControlStateCodeBlockWriter,
  FormControlValidatorCodeBlockWriter,
} from './coerce-form-definition-control';
import {
  GetFormDefinitionClassName,
  GetFormDefinitionFileImportPath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionFormGroupOptions extends CoerceFormDefinitionControlOptions {
  controlList?: ReadonlyArray<Required<AbstractControl>>;
}

export function GetFormGroupNameFromFormDefinitionName(name: string, groupName: string) {
  return [ name.replace(/Form$/, ''), groupName ].join('-');
}

export function CoerceInterfaceFormTypeGroup(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: Required<AbstractControl>,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  const formGroupName = GetFormGroupNameFromFormDefinitionName(classDeclaration.getName()!, control.name);
  CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name)).set({
    type: WriteType({
      name: GetFormDefinitionInterfaceName({ name: formGroupName }),
      moduleSpecifier: GetFormDefinitionFileImportPath({ name: formGroupName }),
    }, sourceFile),
    hasQuestionToken: control.isOptional,
  });
}

export function CoerceFormGroup(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: Required<AbstractControl>,
) {
  const formGroupName = GetFormGroupNameFromFormDefinitionName(classDeclaration.getName()!, control.name);
  CoerceImports(sourceFile, {
    namedImports: [ GetFormDefinitionInterfaceName({ name: formGroupName }), GetFormDefinitionClassName({ name: formGroupName }) ],
    moduleSpecifier: GetFormDefinitionFileImportPath({ name: formGroupName }),
  });
  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name)).set({
    type: GetFormDefinitionClassName({ name: formGroupName }),
    hasExclamationToken: true,
    scope: Scope.Public,
    isReadonly: true,
  });
  const decoratorDeclaration = CoerceDecorator(propertyDeclaration, 'UseFormGroup').set({
    arguments: [
      GetFormDefinitionClassName({ name: formGroupName }),
      w => {
        const items: Record<string, string | WriterFunction> = {};
        if (control.validatorList?.length || control.isRequired) {
          items['validators'] = FormControlValidatorCodeBlockWriter(sourceFile, control);
        }
        if (control.state) {
          items['state'] = FormControlStateCodeBlockWriter(sourceFile, control);
        } else if (control.isArray) {
          items['state'] = '[]';
        }
        if (Object.keys(items).length) {
          Writers.object(items)(w);
        }
      },
    ],
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'RxapFormGroup', 'UseFormGroup' ],
    moduleSpecifier: '@rxap/forms',
  });
  return {
    propertyDeclaration,
    decoratorDeclaration,
  };
}

export function CoerceFormDefinitionFormGroup(options: Readonly<CoerceFormDefinitionFormGroupOptions>): Rule {
  const {
    coerceFormControl = CoerceFormGroup,
    coerceFormTypeControl = CoerceInterfaceFormTypeGroup,
  } = options;

  return CoerceFormDefinitionControl({
    ...options,
    coerceFormControl,
    coerceFormTypeControl,
  });

}
