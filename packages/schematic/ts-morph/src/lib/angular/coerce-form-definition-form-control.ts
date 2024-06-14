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
  Node,
  Scope,
  SourceFile,
  SyntaxKind,
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
  const decoratorDeclaration = CoerceDecorator(propertyDeclaration, 'UseFormControl', { arguments: [] });

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
    const [ firstArgument ] = decoratorDeclaration.getArguments();
    if (!firstArgument) {
      decoratorDeclaration.set({ arguments: [Writers.object(items)] });
    } else {
      const argument = firstArgument.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      if (items['validators']) {
        const validators = argument.getProperty('validators');
        if (validators) {
          // TODO : merge validators
          console.log('validators already exists');
        } else {
          argument.addPropertyAssignment({ name: 'validators', initializer: items['validators'] });
        }
      }
      if (items['state']) {
        const state = argument.getProperty('state');
        if (state) {
          state.asKindOrThrow(SyntaxKind.PropertyAssignment).setInitializer(items['state']);
        } else {
          argument.addPropertyAssignment({ name: 'state', initializer: items['state'] });
        }
      }
    }
  }
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
