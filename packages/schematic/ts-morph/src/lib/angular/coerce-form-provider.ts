import {
  ArrayLiteralExpression,
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { Rule } from '@angular-devkit/schematics';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { ProviderObject } from '../provider-object';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import { AddProviderToArray } from '../add-provider-to-array';
import { CoerceSourceFile } from '../coerce-source-file';

export function CoerceFormProvider(sourceFile: SourceFile, providerObject: ProviderObject | string) {
  const formProviders = CoerceVariableDeclaration(sourceFile, 'FormProviders', {
    type: 'Provider[]',
    initializer: '[]',
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'Provider' ],
    moduleSpecifier: '@angular/core',
  });

  const formProviderArray = formProviders.getInitializer();

  if (!(formProviderArray instanceof ArrayLiteralExpression)) {
    throw new Error('FormProviders initializer is not an array literal expression');
  }

  AddProviderToArray(providerObject, formProviderArray);
}

export interface CoerceFormProviderRuleOptions extends TsMorphAngularProjectTransformOptions {
  providerObject: ProviderObject | string,
  importStructures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>
}

export function CoerceFormProviderRule(
  options: CoerceFormProviderRuleOptions,
): Rule {
  const {importStructures = [], providerObject} = options;
  const fileName = 'form.providers.ts';
  return TsMorphAngularProjectTransform(options, project => {
    const sourceFile = CoerceSourceFile(project, fileName);
    CoerceImports(sourceFile, importStructures);
    CoerceFormProvider(sourceFile, providerObject);
  });
}
