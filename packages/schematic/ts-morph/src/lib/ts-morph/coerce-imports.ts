import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceImports(
  sourceFile: SourceFile,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> | OptionalKind<ImportDeclarationStructure>,
) {

  for (const structure of Array.isArray(structures) ? structures : [ structures ]) {

    const moduleSpecifier = structure.moduleSpecifier.endsWith('.ts') ? structure.moduleSpecifier.replace(/\.ts$/, '') : structure.moduleSpecifier;
    const namedImports = structure.namedImports;

    if (!moduleSpecifier ||
      !(Array.isArray(namedImports) && namedImports.every((named) => typeof named === 'string')) ||
      !sourceFile.getImportDeclaration(moduleSpecifier)) {
      sourceFile.addImportDeclaration(structure);
    } else {
      const importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier)!;
      const existingImports = importDeclaration.getNamedImports();
      for (const named of namedImports) {
        if (!existingImports.some((existing) => existing.getName() === named)) {
          importDeclaration.addNamedImport(named);
        }
      }
    }

  }

}
