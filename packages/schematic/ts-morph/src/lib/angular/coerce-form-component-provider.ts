import {ArrayLiteralExpression, ImportDeclarationStructure, OptionalKind, SourceFile} from 'ts-morph';
import {Rule} from '@angular-devkit/schematics';
import {TsMorphAngularProjectTransform, TsMorphAngularProjectTransformOptions} from '../ts-morph-transform';
import {CoerceImports} from '../ts-morph/coerce-imports';
import {ProviderObject} from '../provider-object';
import {CoerceVariableDeclaration} from '../coerce-variable-declaration';
import {AddProviderToArray} from '../add-provider-to-array';
import {CoerceSourceFile} from '../coerce-source-file';

export function CoerceFormComponentProvider(sourceFile: SourceFile, providerObject: ProviderObject | string) {
  const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'FormComponentProviders', {
    type: 'Provider[]',
    initializer: '[]',
  });
  CoerceImports(sourceFile, {
    namedImports: ['Provider'],
    moduleSpecifier: '@angular/core',
  });

  const formComponentProviderArray = variableDeclaration.getInitializer();

  if (!(formComponentProviderArray instanceof ArrayLiteralExpression)) {
    throw new Error('FormComponentProviders initializer is not an array literal expression');
  }

  AddProviderToArray(providerObject, formComponentProviderArray);
}

export interface CoerceFormComponentProviderRuleOptions extends TsMorphAngularProjectTransformOptions {
  providerObject: ProviderObject | string;
  importStructures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>;
}

export function CoerceFormComponentProviderRule(
  options: CoerceFormComponentProviderRuleOptions,
): Rule {
  let {providerObject, importStructures} = options;
  importStructures ??= [];
  const fileName = 'form.providers.ts';
  return TsMorphAngularProjectTransform(options, project => {
    const sourceFile = CoerceSourceFile(project, fileName);
    CoerceImports(sourceFile, importStructures!);
    CoerceFormComponentProvider(sourceFile, providerObject);
  });
}
