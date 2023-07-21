import {
  ArrayLiteralExpression,
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { ProviderObject } from '@rxap/schematics-ts-morph/src/lib/provider-object';
import {
  AddProviderToArray,
  CoerceSourceFile,
  CoerceVariableDeclaration,
} from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';

export function CoerceFormBuilderProvider(sourceFile: SourceFile, providerObject: ProviderObject | string) {
  const formProviders = CoerceVariableDeclaration(sourceFile, 'FormBuilderProviders', {
    type: 'Provider[]',
    initializer: '[]',
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'Provider' ],
    moduleSpecifier: '@angular/core',
  });

  const formProviderArray = formProviders.getInitializer();

  if (!(formProviderArray instanceof ArrayLiteralExpression)) {
    throw new Error('FormBuilderProviders initializer is not an array literal expression');
  }

  AddProviderToArray(providerObject, formProviderArray);
}

export interface CoerceFormBuilderProviderRuleOptions {
  project: string;
  feature: string;
  directory?: string;
}

export function CoerceFormBuilderProviderRule(
  options: CoerceFormBuilderProviderRuleOptions,
  providerObject: ProviderObject | string,
  importStructures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
): Rule {
  const fileName = 'form.providers.ts';
  return TsMorphAngularProjectTransform(options, project => {
    const sourceFile = CoerceSourceFile(project, fileName);
    CoerceImports(sourceFile, importStructures);
    CoerceFormBuilderProvider(sourceFile, providerObject);
  });
}
