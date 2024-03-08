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

export type CoerceFormDefinitionFormControlOptions = CoerceFormDefinitionControlOptions

export function CoerceInterfaceFormTypeControl(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: AbstractControl,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name)).set({ type: WriteType(control, sourceFile) });
}

export function CoerceFormControl(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: AbstractControl,
) {
  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name)).set({
    type: w => {
      w.write('RxapFormControl<');
      WriteType(control, sourceFile)(w);
      w.write('>');
    },
    hasExclamationToken: true,
    scope: Scope.Public,
    isReadonly: true,
  });
  const decoratorDeclaration = CoerceDecorator(propertyDeclaration, 'UseFormControl').set({
    arguments: [
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
    namedImports: [ 'RxapFormControl', 'UseFormControl' ],
    moduleSpecifier: '@rxap/forms',
  });
  return {
    propertyDeclaration,
    decoratorDeclaration,
  };
}

export function CoerceFormDefinitionFormControl(options: Readonly<CoerceFormDefinitionControlOptions>): Rule {
  const {
    coerceFormControl = CoerceFormControl,
    coerceFormTypeControl = CoerceInterfaceFormTypeControl,
  } = options;

  return CoerceFormDefinitionControl({
    ...options,
    coerceFormControl,
    coerceFormTypeControl,
  });

}
