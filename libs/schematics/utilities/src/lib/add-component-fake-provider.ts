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

export function AddComponentFakeProvider(
  sourceFile: SourceFile,
  fakeProviderObject: ProviderObject | string | undefined,
  realProviderObject: ProviderObject | string | undefined,
  fakeName: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite: boolean                                                  = false
) {

  const hasFakeProviderFactory = !!sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY');

  CoerceVariableDeclaration(
    sourceFile,
    'FAKE_PROVIDER_FACTORY',
    {
      initializer: `IsFaked('${fakeName}') ? FAKE_PROVIDERS : REAL_PROVIDERS`
    }
  );

  const fakeArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'FAKE_PROVIDERS',
    'Provider[]'
  );

  const realArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'REAL_PROVIDERS',
    'Provider[]'
  );

  const fakeArrayInitializer = fakeArrayDeclaration.getInitializer();

  AssertArrayLiteralExpression(fakeArrayInitializer, 'FAKE_PROVIDERS');

  if (fakeProviderObject) {
    AddProviderToArray(
      fakeProviderObject,
      fakeArrayInitializer,
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
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@rxap/fake',
    namedImports: [ 'IsFaked' ]
  });

  sourceFile.addImportDeclarations(structures);

  AddComponentProvider(sourceFile, 'FAKE_PROVIDER_FACTORY');

  // region order variable statements

  // ensures that the variable declaration is before the component decorator
  if (!hasFakeProviderFactory) {
    // only re order if the member were added in this method
    const classOrder = Math.max(
      sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY')?.getChildIndex() ?? 0,
      sourceFile.getVariableStatement('FAKE_PROVIDERS')?.getChildIndex() ?? 0,
      sourceFile.getVariableStatement('REAL_PROVIDERS')?.getChildIndex() ?? 0
    );
    sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY')?.setOrder(classOrder);
    sourceFile.getClasses()[ 0 ]?.setOrder(classOrder);
  }

  // endregion

}

/*

 const FAKE_PROVIDERS = [];

 const FAKE_PROVIDER_FACTORY = isDevMode() ? FAKE_PROVIDERS : [];

 @Component({
 provider: [
 FAKE_PROVIDER_FACTORY
 ]
 })

 */
