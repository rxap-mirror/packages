import { coerceArray } from '@rxap/utilities';
import {
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
} from 'ts-morph';

export function CoerceImports(
  sourceFile: SourceFile,
  structures: Array<OptionalKind<ImportDeclarationStructure>> | OptionalKind<ImportDeclarationStructure>,
): void {

  for (const structure of coerceArray(structures)) {

    const {
      moduleSpecifier,
      namedImports,
      namespaceImport,
      isTypeOnly,
      defaultImport,
    } = structure;

    if (namedImports) {

      if (!isSupportedNamedImports(namedImports)) {
        throw new Error(
          'Invalid named imports. Ensure that all named imports are either a string or an object and not a WriteFunction.');
      }

      coerceNamedImports(sourceFile, moduleSpecifier, normalizeNamedImports(namedImports, isTypeOnly));

    }
    if (namespaceImport) {
      coerceNamespaceImport(sourceFile, moduleSpecifier, namespaceImport);
    }
    if (defaultImport) {
      coerceDefaultImport(sourceFile, moduleSpecifier, defaultImport);
    }

  }

}

function coerceDefaultImport(sourceFile: SourceFile, moduleSpecifier: string, defaultImport: string): void {

  const importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier);

  if (importDeclaration) {
    const existingDefaultImport = importDeclaration.getDefaultImport();
    if (!existingDefaultImport) {
      importDeclaration.setDefaultImport(defaultImport);
    } else if (existingDefaultImport.getText() !== defaultImport) {
      importDeclaration.removeDefaultImport();
      importDeclaration.setDefaultImport(defaultImport);
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      defaultImport,
    });
  }
}

function coerceNamespaceImport(sourceFile: SourceFile, moduleSpecifier: string, namespaceImport: string): void {

  const importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier);

  if (importDeclaration) {
    const existingNamespaceImport = importDeclaration.getNamespaceImport();
    if (!existingNamespaceImport) {
      importDeclaration.setNamespaceImport(namespaceImport);
    } else if (existingNamespaceImport.getText() !== namespaceImport) {
      importDeclaration.removeNamespaceImport();
      importDeclaration.setNamespaceImport(namespaceImport);
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namespaceImport,
    });
  }
}

function isSupportedNamedImports(namedImports: (OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction): namedImports is Array<string | OptionalKind<ImportSpecifierStructure>> {
  return Array.isArray(namedImports) &&
    namedImports.every((named) => typeof named === 'string' || typeof named === 'object');
}

function normalizeNamedImports(
  namedImports: Array<string | OptionalKind<ImportSpecifierStructure>>,
  isTypeOnly?: boolean,
): Array<OptionalKind<ImportSpecifierStructure>> {
  return namedImports.map((named) => typeof named === 'string' ?
    {
      name: named,
      isTypeOnly,
    } :
    named);
}

function coerceNamedImports(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedImports: Array<OptionalKind<ImportSpecifierStructure>>,
): void {

  const importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier);

  if (importDeclaration) {
    const existingImports = importDeclaration.getNamedImports();
    for (const named of namedImports) {
      if (!existingImports.some((existing) => existing.getName() === named.name)) {
        importDeclaration.addNamedImport(named);
      }
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports,
    });
  }

}
