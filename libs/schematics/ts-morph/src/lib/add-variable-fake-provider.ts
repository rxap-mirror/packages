import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { ProviderObject } from './provider-object';
import {
  AddFakeProvider
} from './add-fake-provider';
import { AddVariableProvider } from './add-variable-provider';

export function AddVariableFakeProvider(
  sourceFile: SourceFile,
  variableName: string,
  fakeProviderObject: ProviderObject | string | undefined,
  realProviderObject: ProviderObject | string | undefined,
  fakeName: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite: boolean                                                  = false
) {

  AddVariableProvider(
    sourceFile,
    variableName,
    'FAKE_PROVIDER_FACTORY',
    structures,
    overwrite
  );

  AddFakeProvider(
    sourceFile,
    fakeProviderObject,
    realProviderObject,
    fakeName,
    overwrite
  );

}
