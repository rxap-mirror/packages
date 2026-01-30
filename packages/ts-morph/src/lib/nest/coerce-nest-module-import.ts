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
  /**
   * The name of the module to import.
   */
  moduleName: string;
  /**
   * Import structures to add.
   */
  structures?: Array<OptionalKind<ImportDeclarationStructure>>;
  /**
   * Custom writer for the import expression (e.g. `Module.forRoot()`).
   */
  importWriter?: WriterFunction;
  /**
   * If true, overwrites existing import.
   */
  overwrite?: boolean;
  /**
   * Module specifier for the module class.
   */
  moduleSpecifier?: string;
}

/**
 * Coerces an import in a NestJS module imports array.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the module import (module name, specifier, etc.).
 */
export function CoerceNestModuleImport(
  sourceFile: SourceFile,
  options: CoerceNestModuleImportOptions,
) {
  const {
    moduleName,
    importWriter,
    overwrite,
    moduleSpecifier,
  } = options;

  let { structures } = options;

  structures ??= [];

  if (moduleSpecifier) {
    structures.push({
      moduleSpecifier,
      namedImports: [ moduleName ],
    });
  }

  CoerceImports(sourceFile, structures ?? []);

  const metadata = GetNestModuleMetadata(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'imports');

  const index = importsArray.getElements().findIndex(element => element.getText().trim().startsWith(moduleName));

  if (index === -1 || overwrite) {

    if (index !== -1) {
      importsArray.removeElement(index);
    }

    importsArray.addElement(importWriter ?? moduleName);

  }

}
