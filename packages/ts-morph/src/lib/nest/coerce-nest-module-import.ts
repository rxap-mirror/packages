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
  structures?: Array<OptionalKind<ImportDeclarationStructure>>;
  importWriter?: WriterFunction;
  overwrite?: boolean;
  moduleSpecifier?: string;
}

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

  const hasModule = importsArray.getElements().find(element => element.getFullText().trim().startsWith(moduleName));

  if (!hasModule || overwrite) {

    if (hasModule) {
      importsArray.removeElement(hasModule.getChildIndex());
    }

    importsArray.addElement(importWriter ?? moduleName);

  }

}
