import { coerceArray } from '@rxap/utilities';
import {
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
} from 'ts-morph';

/**
 * This function, `CoerceImports`, is used to coerce import declarations in a given source file. It takes two parameters: `sourceFile` and `structures`.
 *
 * @param {SourceFile} sourceFile - The source file in which the import declarations are to be processed. This is an instance of the `SourceFile` class.
 *
 * @param {Array<OptionalKind<ImportDeclarationStructure>> | OptionalKind<ImportDeclarationStructure>} structures - An array of import declaration structures or a single import declaration structure. Each structure can be of type `OptionalKind<ImportDeclarationStructure>`, which means it may or may not contain certain properties.
 *
 * The function iterates over each import declaration structure in `structures`. For each structure, it extracts the following properties: `moduleSpecifier`, `namedImports`, `namespaceImport`, `isTypeOnly`, and `defaultImport`.
 *
 * If `namedImports` is present, it checks if the named imports are supported using the `isSupportedNamedImports` function. If not, it throws an error. If they are supported, it coerces the named imports using the `coerceNamedImports` function.
 *
 * If `namespaceImport` is present, it coerces the namespace import using the `coerceNamespaceImport` function.
 *
 * If `defaultImport` is present, it coerces the default import using the `coerceDefaultImport` function.
 *
 * The function does not return any value.
 *
 * Note: This function does not modify the original `sourceFile` or `structures` parameters. It only processes and validates the import declarations.
 */
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
      coerceNamedImports(sourceFile, moduleSpecifier, namedImports, isTypeOnly);
    }

    if (namespaceImport) {
      coerceNamespaceImport(sourceFile, moduleSpecifier, namespaceImport);
    }

    if (defaultImport) {
      coerceDefaultImport(sourceFile, moduleSpecifier, defaultImport);
    }

  }

}

/**
 * This method is used to coerce the default import of a module in a source file. If the import declaration for the specified module exists, it checks for the existence of a default import. If a default import does not exist, it sets the default import to the provided value. If a default import exists and it does not match the provided value, it removes the existing default import and sets it to the provided value. If the import declaration for the specified module does not exist, it adds a new import declaration with the provided module specifier and default import.
 *
 * @param {SourceFile} sourceFile - The source file in which the import declaration is to be coerced.
 * @param {string} moduleSpecifier - The specifier of the module whose import declaration is to be coerced.
 * @param {string} defaultImport - The value to be set as the default import in the import declaration.
 *
 * @returns {void} This method does not return anything.
 *
 * @example
 * // Assuming `sourceFile` is a SourceFile instance and `moduleSpecifier` is 'myModule' and `defaultImport` is 'myDefaultImport'
 * coerceDefaultImport(sourceFile, 'myModule', 'myDefaultImport');
 */
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

/**
 * This method is used to coerce or enforce a specific namespace import in a given source file.
 * It first checks if an import declaration for the provided module specifier already exists in the source file.
 * If such an import declaration exists, it then checks if a namespace import is already present.
 * If no namespace import is present, it sets the namespace import to the provided namespace import.
 * If a namespace import is present and it does not match the provided namespace import, it removes the existing namespace import and sets it to the provided namespace import.
 * If no import declaration for the provided module specifier exists, it adds a new import declaration with the provided module specifier and namespace import.
 *
 * @param {SourceFile} sourceFile - The source file in which to enforce the namespace import.
 * @param {string} moduleSpecifier - The module specifier for which to enforce the namespace import.
 * @param {string} namespaceImport - The namespace import to be enforced in the source file for the provided module specifier.
 * @returns {void} This method does not return anything.
 */
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

/**
 * Checks if the provided named imports are supported.
 *
 * @param {((OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction)} namedImports - The named imports to be checked. This can be an array of `OptionalKind<ImportSpecifierStructure>`, `string`, `WriterFunction` or a single `WriterFunction`.
 *
 * @returns {boolean} Returns `true` if the `namedImports` is an array and every element in the array is either a `string` or an `OptionalKind<ImportSpecifierStructure>`. Otherwise, it returns `false`.
 *
 * @example
 * // returns true
 * isSupportedNamedImports(['import1', 'import2', { name: 'import3', alias: 'alias3' }])
 *
 * @example
 * // returns false
 * isSupportedNamedImports(() => 'import1')
 *
 * @example
 * // returns false
 * isSupportedNamedImports(['import1', () => 'import2', { name: 'import3', alias: 'alias3' }])
 *
 */
function isSupportedNamedImports(namedImports: (OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction): namedImports is Array<string | OptionalKind<ImportSpecifierStructure>> {
  return Array.isArray(namedImports) &&
    namedImports.every((named) => typeof named === 'string' || typeof named === 'object');
}

/**
 * Transforms an array of named imports into a standardized format.
 *
 * @param {Array<string | OptionalKind<ImportSpecifierStructure>>} namedImports - An array of named imports. Each import can either be a string or an instance of `OptionalKind<ImportSpecifierStructure>`.
 * @param {boolean} [isTypeOnly=false] - An optional flag indicating whether the import is type-only. If not provided, defaults to `false`.
 *
 * @returns {Array<OptionalKind<ImportSpecifierStructure>>} - Returns an array of `OptionalKind<ImportSpecifierStructure>`. Each element in the array represents a named import, and includes the name of the import and a flag indicating whether it is type-only.
 *
 * @example
 * // Given the following input:
 * // ['import1', { name: 'import2', isTypeOnly: true }]
 * // The function will return:
 * // [{ name: 'import1', isTypeOnly: false }, { name: 'import2', isTypeOnly: true }]
 *
 * @remarks
 * This function is useful for standardizing the format of named imports, especially when dealing with a mix of string and `OptionalKind<ImportSpecifierStructure>` imports.
 */
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

/**
 * This function `coerceNamedImports` is used to manage named imports in a TypeScript source file.
 * It either adds new named imports to an existing import declaration or creates a new import declaration if one does not exist.
 *
 * @param {SourceFile} sourceFile - The TypeScript source file to be manipulated.
 * @param {string} moduleSpecifier - The string specifier of the module from which the imports are derived.
 * @param {Array<OptionalKind<ImportSpecifierStructure>>} namedImports - An array of named imports to be added. Each import is an object of type `OptionalKind<ImportSpecifierStructure>`.
 * @param isTypeOnly - An optional flag indicating whether the import is type-only. If not provided, defaults to `false`.
 *
 * The function does not return any value.
 *
 * The function first tries to find an existing import declaration from the specified module in the source file.
 * If such an import declaration exists, the function iterates over the provided named imports.
 * For each named import, it checks if the import already exists in the import declaration.
 * If the named import does not exist, it is added to the import declaration.
 *
 * If no import declaration from the specified module exists in the source file, a new import declaration is created.
 * The new import declaration includes all the provided named imports.
 */
function coerceNamedImports(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedImports: Array<OptionalKind<ImportSpecifierStructure> | string | WriterFunction> | WriterFunction,
  isTypeOnly?: boolean,
): void {

  const importDeclarations = sourceFile.getImportDeclarations()
                                       .filter(id => id.getModuleSpecifier().getLiteralText() === moduleSpecifier);

  if (!isSupportedNamedImports(namedImports)) {
    if (!importDeclarations.length) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports,
        isTypeOnly,
      });
      return;
    } else {
      throw new Error(
        'Invalid named imports. Ensure that all named imports are either a string or an object and not a WriteFunction.');
    }
  }

  const normalizedNamedImports = normalizeNamedImports(namedImports, isTypeOnly);

  const typeOnlyNamedImports = normalizedNamedImports.filter((named) => named.isTypeOnly);
  const nonTypeOnlyNamedImports = normalizedNamedImports.filter((named) => !named.isTypeOnly);

  const typeOnlyImportDeclarations = importDeclarations.filter((id) => id.isTypeOnly());
  const nonTypeOnlyImportDeclarations = importDeclarations.filter((id) => !id.isTypeOnly());

  if (nonTypeOnlyNamedImports.length) {
    if (!nonTypeOnlyImportDeclarations.length) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: nonTypeOnlyNamedImports,
      });
    } else {
      for (const importDeclaration of nonTypeOnlyImportDeclarations) {
        const existingImports = importDeclaration.getNamedImports();
        for (const named of normalizedNamedImports) {
          if (!existingImports.some((existing) => existing.getName() === named.name)) {
            const namedImport = importDeclaration.addNamedImport(named);
            namedImport.setIsTypeOnly(named.isTypeOnly ?? false);
          }
        }
      }
    }
  }

  if (typeOnlyNamedImports.length) {
    if (!typeOnlyImportDeclarations.length) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: typeOnlyNamedImports,
      });
    } else {
      for (const importDeclaration of typeOnlyImportDeclarations) {
        const existingImports = importDeclaration.getNamedImports();
        for (const named of normalizedNamedImports) {
          if (!existingImports.some((existing) => existing.getName() === named.name)) {
            const namedImport = importDeclaration.addNamedImport(named);
            namedImport.setIsTypeOnly(named.isTypeOnly ?? false);
          }
        }
      }
    }
  }

}
