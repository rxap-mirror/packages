import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

export interface HasNestModuleImportOptions {
  /**
   * The name of the module import to check for.
   */
  moduleName: string;
}

/**
 * Checks if a NestJS module has a specific import in its metadata.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options containing the module name to check.
 * @returns True if the import exists.
 */
export function HasNestModuleImport(
  sourceFile: SourceFile,
  options: HasNestModuleImportOptions,
): boolean {
  const {
    moduleName,
  } = options;

  const metadata = GetNestModuleMetadata(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'imports');

  const index = importsArray.getElements().findIndex(element => element.getText().trim().startsWith(moduleName));

  return index !== -1;

}
