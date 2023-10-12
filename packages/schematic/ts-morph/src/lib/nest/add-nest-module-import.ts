import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

/**
 * @deprecated import from @rxap/ts-morph as CoerceNestModuleImport
 */
export function AddNestModuleImport(
  sourceFile: SourceFile,
  moduleName: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  importWriter?: WriterFunction,
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const metadata = GetNestModuleMetadata(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'imports');

  const hasModule = importsArray.getElements().find(element => element.getText().trim().startsWith(moduleName));

  if (!hasModule || overwrite) {

    if (hasModule) {
      importsArray.removeElement(hasModule.getChildIndex());
    }

    importsArray.addElement(importWriter ?? moduleName);

  }

}
