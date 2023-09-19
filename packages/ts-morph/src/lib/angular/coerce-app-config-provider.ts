import {
  ArrayLiteralExpression,
  CallExpression,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { AddProviderToArray } from '../add-provider-to-array';
import { CoerceImports } from '../coerce-imports';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { ProviderObject } from '../provider-object';

export interface CoerceAppConfigProviderOptions {
  providers?: Array<ProviderObject | string>;
  overwrite?: boolean;
  httpInterceptors?: string[];
  importProvidersFrom?: string[];
}

export function CoerceAppConfigProvider(sourceFile: SourceFile, options: CoerceAppConfigProviderOptions) {
  const { providers = [], httpInterceptors = [], importProvidersFrom = [], overwrite = false } = options;
  const appConfigVariableDeclaration = CoerceVariableDeclaration(sourceFile, 'appConfig', {
    initializer: '{ providers: [] }',
    type: 'ApplicationConfig',
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'ApplicationConfig' ],
    moduleSpecifier: '@angular/core',
  });
  const appConfig: ObjectLiteralExpression = appConfigVariableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(appConfig, 'providers');
  for (const providerObject of providers) {
    AddProviderToArray(providerObject, providerArray, overwrite);
  }
  if (httpInterceptors.length) {
    const phcExpression = AddProviderToArray('provideHttpClient()', providerArray, overwrite)
      .asKindOrThrow(SyntaxKind.CallExpression);
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/common/http',
      namedImports: [ 'provideHttpClient' ],
    });
    const index = phcExpression.getArguments().findIndex(a => a.getText().startsWith('withInterceptors('));
    let wiAExpression: ArrayLiteralExpression;
    let wiExpression: CallExpression;
    if (index === -1) {
      wiExpression = phcExpression.addArgument('withInterceptors()').asKindOrThrow(SyntaxKind.CallExpression);
      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/common/http',
        namedImports: [ 'withInterceptors' ],
      });
    } else {
      wiExpression = phcExpression.getArguments()[index].asKindOrThrow(SyntaxKind.CallExpression);
    }
    if (wiExpression.getArguments()[0]) {
      wiAExpression = wiExpression.getArguments()[0].asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    } else {
      wiAExpression = wiExpression.addArgument('[]').asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    }
    for (const hi of httpInterceptors) {
      const index = wiAExpression.getElements().findIndex(a => a.getText() === hi);
      if (index === -1) {
        wiAExpression.addElement(hi);
      }
    }
  }
  if (importProvidersFrom.length) {
    const ipfExpression = AddProviderToArray('importProvidersFrom()', providerArray, overwrite)
      .asKindOrThrow(SyntaxKind.CallExpression);
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'importProvidersFrom' ],
    });
    for (const ipf of importProvidersFrom) {
      const index = ipfExpression.getArguments().findIndex(a => a.getText() === ipf);
      if (index === -1) {
        ipfExpression.addArgument(ipf);
      }
    }
  }
}
