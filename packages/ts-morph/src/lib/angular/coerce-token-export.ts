import {
  CoerceImports,
  CoerceVariableDeclaration,
  TypeImport,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  SourceFile,
  VariableDeclarationKind,
} from 'ts-morph';

export interface CoerceTokenExportOptions {
  /**
   * The name of the token constant.
   */
  name: string;
  /**
   * Description for the token (used in constructor).
   */
  description?: string;
  /**
   * The type of value injected by the token.
   */
  type?: TypeImport;
  /**
   * If true, overwrites the existing token declaration.
   */
  overwrite?: boolean;
}

/**
 * Coerces an InjectionToken export in a source file.
 * Creates a constant exporting a new InjectionToken.
 *
 * @param sourceFile - The source file.
 * @param options - Options for the token (name, description, type).
 * @returns The variable declaration for the token.
 */
export function CoerceTokenExport(sourceFile: SourceFile, options: CoerceTokenExportOptions) {

  const {
    name,
    description = name,
    type,
    overwrite = false,
  } = options;
  const initializer = `new InjectionToken<${ type?.name ?? 'any' }>('${ description }')`;
  const variableDeclaration = CoerceVariableDeclaration(sourceFile, name, { initializer }, {
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
  });
  if (overwrite) {
    variableDeclaration.setInitializer(initializer);
  }
  CoerceImports(sourceFile, {
    namedImports: [ 'InjectionToken' ],
    moduleSpecifier: '@angular/core',
  });
  if (type) {
    CoerceImports(sourceFile, TypeImportToImportStructure(type));
  }
  return variableDeclaration;
}
