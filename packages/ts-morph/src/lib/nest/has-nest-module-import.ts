import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

export interface HasNestModuleImportOptions {
  moduleName: string;
}

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
