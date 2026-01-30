import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

export interface RemoveNestModuleImportOptions {
  /**
   * The name of the module import to remove.
   */
  moduleName: string;
}

/**
 * Removes an import from a NestJS module `imports` array.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options containing the module name to remove.
 */
export function RemoveNestModuleImport(
  sourceFile: SourceFile,
  options: RemoveNestModuleImportOptions,
) {
  const {
    moduleName,
  } = options;

  const metadata = GetNestModuleMetadata(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'imports');

  const index = importsArray.getElements().findIndex(element => element.getText().trim().startsWith(moduleName));

  if (index !== -1) {
    importsArray.removeElement(index);
  }

}
