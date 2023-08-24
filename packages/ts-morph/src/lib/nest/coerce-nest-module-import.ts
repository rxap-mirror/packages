import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

export interface CoerceNestModuleImportOptions {
  moduleName: string;
  structures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>;
  importWriter?: WriterFunction;
  overwrite?: boolean;
}

export function CoerceNestModuleImport(
  sourceFile: SourceFile,
  options: CoerceNestModuleImportOptions,
) {
  const {
    moduleName,
    structures,
    importWriter,
    overwrite,
  } = options;

  CoerceImports(sourceFile, structures ?? []);

  const metadata = GetNestModuleMetadata(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'imports');

  const hasModule = importsArray.getElements().find(element => element.getFullText().trim().startsWith(moduleName));

  if (!hasModule || overwrite) {

    if (hasModule) {
      importsArray.removeElement(hasModule.getChildIndex());
    }

    importsArray.addElement(importWriter ?? moduleName);

  }

}
