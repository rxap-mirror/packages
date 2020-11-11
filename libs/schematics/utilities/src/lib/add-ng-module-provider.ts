import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers
} from 'ts-morph';
import { ProviderObject } from './provider-object';
import { GetNgModuleOptionsObject } from './get-ng-module-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';
import { DeleteUndefinedProperties } from '@rxap/utilities';

export function AddNgModuleProvider(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>
) {

  sourceFile.addImportDeclarations(structures);

  const ngModuleOptions = GetNgModuleOptionsObject(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'providers');

  if (typeof providerObject === 'string') {

    if (!providerArray.getElements().some(element => element.getFullText().trim() === providerObject)) {
      providerArray.addElement(providerObject);
    }

  } else {

    const index = providerArray.getElements().findIndex(element => {

      if (element instanceof ObjectLiteralExpression) {

        const provideProperty = element.getProperty('provide');

        if (provideProperty instanceof PropertyAssignment) {

          return provideProperty.getInitializer()?.getFullText().trim() === providerObject.provide;

        }

      }

      return false;

    });

    if (index === -1) {
      providerArray.addElement(Writers.object(DeleteUndefinedProperties({
        provide:     providerObject.provide,
        useClass:    providerObject.useClass,
        useFactory:  providerObject.useFactory,
        useExisting: providerObject.useExisting,
        useValue:    providerObject.useValue,
        deps:        providerObject.deps ? `[ ${providerObject.deps.join(',')} ]` : undefined
      })));
    }

  }

}
