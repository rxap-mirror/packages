import {
  InterfaceDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';

/**
 * Coerces an interface declaration in a source file.
 * If the interface exists, it returns it. Otherwise, it creates it.
 *
 * @param sourceFile - The source file to look in or add to.
 * @param interfaceName - The name of the interface.
 * @param structure - Optional structure to apply to the interface if it is created.
 * @returns The existing or created interface declaration.
 */
export function CoerceInterface(
  sourceFile: SourceFile,
  interfaceName: string,
  structure: Omit<OptionalKind<InterfaceDeclarationStructure>, 'name'> = {},
) {
  let interfaceDeclaration = sourceFile.getInterface(interfaceName);
  if (!interfaceDeclaration) {
    interfaceDeclaration = sourceFile.addInterface({
      ...structure,
      name: interfaceName,
    });
  }
  return interfaceDeclaration;
}


