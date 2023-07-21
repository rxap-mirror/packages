import { ProviderObject } from './provider-object';
import { GetArrayDeclaration } from './get-array-declaration';
import { AssertArrayLiteralExpression } from './is-array-literal-expression';
import { SourceFile } from 'ts-morph';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { AddProviderToArray } from './add-provider-to-array';
import { CoerceImports } from './ts-morph/coerce-imports';

export function AddFakeProvider(
  sourceFile: SourceFile,
  fakeProviderObject: ProviderObject | string | undefined,
  realProviderObject: ProviderObject | string | undefined,
  fakeName: string,
  overwrite = false,
) {

  const hasFakeProviderFactory = !!sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY');

  CoerceVariableDeclaration(
    sourceFile,
    'FAKE_PROVIDER_FACTORY',
    {
      initializer: `IsFaked('${ fakeName }') ? FAKE_PROVIDERS : REAL_PROVIDERS`,
    },
  );

  const fakeArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'FAKE_PROVIDERS',
    'Provider[]',
  );

  const realArrayDeclaration = GetArrayDeclaration(
    sourceFile,
    'REAL_PROVIDERS',
    'Provider[]',
  );

  const fakeArrayInitializer = fakeArrayDeclaration.getInitializer();

  AssertArrayLiteralExpression(fakeArrayInitializer, 'FAKE_PROVIDERS');

  if (fakeProviderObject) {
    AddProviderToArray(
      fakeProviderObject,
      fakeArrayInitializer,
      overwrite,
    );
  }

  const realArrayInitializer = realArrayDeclaration.getInitializer();

  AssertArrayLiteralExpression(realArrayInitializer, 'REAL_PROVIDERS');

  if (realProviderObject) {
    AddProviderToArray(
      realProviderObject,
      realArrayInitializer,
      overwrite,
    );
  }

  CoerceImports(sourceFile, {
    moduleSpecifier: '@angular/core',
    namedImports: [ 'Provider' ],
  });
  CoerceImports(sourceFile, {
    moduleSpecifier: '@rxap/fake',
    namedImports: [ 'IsFaked' ],
  });

  // region order variable statements

  // ensures that the variable declaration is before the component decorator
  if (!hasFakeProviderFactory) {
    // only re order if the member were added in this method
    const classOrder = Math.max(
      sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY')?.getChildIndex() ?? 0,
      sourceFile.getVariableStatement('FAKE_PROVIDERS')?.getChildIndex() ?? 0,
      sourceFile.getVariableStatement('REAL_PROVIDERS')?.getChildIndex() ?? 0,
    );
    sourceFile.getVariableStatement('FAKE_PROVIDER_FACTORY')?.setOrder(classOrder);
    sourceFile.getClasses()[0]?.setOrder(classOrder);
  }

  // endregion

}
