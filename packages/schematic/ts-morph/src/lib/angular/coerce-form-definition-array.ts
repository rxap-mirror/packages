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

export interface CoerceFormDefinitionFormArrayOptions extends CoerceFormDefinitionControlOptions {
  controlList?: ReadonlyArray<Required<AbstractControl>>;
}
export function CoerceInterfaceFormTypeArray(
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
  const formArrayName = GetFormArrayNameFromFormDefinitionName(classDeclaration.getName()!, control.name);
  CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name)).set({
    type: WriteType({
      type: {
        name: GetFormDefinitionInterfaceName({ name: formArrayName }),
        moduleSpecifier: GetFormDefinitionFileImportPath({ name: formArrayName }),
      },
      isArray: true,
    }, sourceFile),
    hasQuestionToken: control.isOptional,
  });
}

export function GetFormArrayNameFromFormDefinitionName(name: string, groupName: string) {
  return [ name.replace(/Form$/, ''), groupName ].join('-');
}

export function CoerceFormArray(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: Required<AbstractControl>,
) {
  const formArrayName = GetFormArrayNameFromFormDefinitionName(classDeclaration.getName()!, control.name);
  CoerceImports(sourceFile, {
    namedImports: [ GetFormDefinitionInterfaceName({ name: formArrayName }), GetFormDefinitionClassName({ name: formArrayName }) ],
    moduleSpecifier: GetFormDefinitionFileImportPath({ name: formArrayName }),
  });
  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name)).set({
    type: w => {
      w.write('FormDefinitionArray<');
      w.write(GetFormDefinitionClassName({ name: formArrayName }));
      w.write('>');
    },
    hasExclamationToken: true,
    scope: Scope.Public,
    isReadonly: true,
  });
  const decoratorDeclaration = CoerceDecorator(propertyDeclaration, 'UseFormArrayGroup').set({
    arguments: [
      GetFormDefinitionClassName({ name: formArrayName }),
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
    namedImports: [ 'UseFormArrayGroup', 'FormDefinitionArray' ],
    moduleSpecifier: '@rxap/forms',
  });
  return {
    propertyDeclaration,
    decoratorDeclaration,
  };
}

export function CoerceFormDefinitionFormArray(options: Readonly<CoerceFormDefinitionFormArrayOptions>): Rule {
  const {
    coerceFormControl = CoerceFormArray,
    coerceFormTypeControl = CoerceInterfaceFormTypeArray,
  } = options;

  return CoerceFormDefinitionControl({
    ...options,
    coerceFormControl,
    coerceFormTypeControl,
  });

}
