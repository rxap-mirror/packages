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
  name: string;
  description?: string;
  type?: TypeImport;
}

export function CoerceTokenExport(sourceFile: SourceFile, options: CoerceTokenExportOptions) {

  const {
    name,
    description = name,
    type,
  } = options;
  const initializer = `new InjectionToken<${ type?.name ?? 'any' }>('${ description }')`;
  CoerceVariableDeclaration(sourceFile, name, { initializer }, {
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
  }).setInitializer(initializer);
  CoerceImports(sourceFile, {
    namedImports: [ 'InjectionToken' ],
    moduleSpecifier: '@angular/core',
  });
  if (type) {
    CoerceImports(sourceFile, TypeImportToImportStructure(type));
  }

}
