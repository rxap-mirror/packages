import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { ProviderObject } from './provider-object';
import { AddComponentProvider } from './add-component-provider';
import { AddFakeProvider } from './add-fake-provider';

export function AddComponentFakeProvider(
  sourceFile: SourceFile,
  fakeProviderObject: ProviderObject | string | undefined,
  realProviderObject: ProviderObject | string | undefined,
  fakeName: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  AddComponentProvider(
    sourceFile,
    'FAKE_PROVIDER_FACTORY',
    structures,
    overwrite,
  );

  AddFakeProvider(
    sourceFile,
    fakeProviderObject,
    realProviderObject,
    fakeName,
    overwrite,
  );

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
