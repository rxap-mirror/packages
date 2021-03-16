import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { GetArrayDeclaration } from './get-array-declaration';
import { AssertArrayLiteralExpression } from './is-array-literal-expression';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { ProviderObject } from './provider-object';
import { AddProviderToArray } from './add-provider-to-array';
import { AddComponentProvider } from './add-component-provider';

export function AddComponentMockProvider(
  sourceFile: SourceFile,
  mockProviderObject: ProviderObject | string | undefined,
  realProviderObject: ProviderObject | string | undefined,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite: boolean                                                  = false
) {

  CoerceVariableDeclaration(
    sourceFile,
    'MOCK_PROVIDER_FACTORY',
    {
      initializer: 'isDevMode() ? MOCK_PROVIDERS : REAL_PROVIDERS'
    }
  );

  const mockArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'MOCK_PROVIDERS',
    'Provider[]'
  );

  const realArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'REAL_PROVIDERS',
    'Provider[]'
  );

  const mockArrayInitializer = mockArrayDeclaration.getInitializer();

  AssertArrayLiteralExpression(mockArrayInitializer, 'MOCK_PROVIDERS');

  if (mockProviderObject) {
    AddProviderToArray(
      mockProviderObject,
      mockArrayInitializer,
      overwrite
    );
  }

  const realArrayInitializer = realArrayDeclaration.getInitializer();

  AssertArrayLiteralExpression(realArrayInitializer, 'REAL_PROVIDERS');

  if (realProviderObject) {
    AddProviderToArray(
      realProviderObject,
      realArrayInitializer,
      overwrite
    );
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@angular/core',
    namedImports:    [ 'isDevMode', 'Provider' ]
  });

  sourceFile.addImportDeclarations(structures);

  AddComponentProvider(sourceFile, 'MOCK_PROVIDER_FACTORY');
}

/*

 const MOCK_PROVIDERS = [];

 const MOCK_PROVIDER_FACTORY = isDevMode() ? MOCK_PROVIDERS : [];

 @Component({
 provider: [
 MOCK_PROVIDER_FACTORY
 ]
 })

 */
