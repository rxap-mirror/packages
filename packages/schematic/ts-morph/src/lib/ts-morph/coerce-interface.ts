import {
  InterfaceDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';

export function CoerceInterface(
  sourceFile: SourceFile,
  interfaceName: string,
  structure: Omit<OptionalKind<InterfaceDeclarationStructure>, 'name'> = {},
) {
  let interfaceDeclaration = sourceFile.getInterface(interfaceName);
  if (!interfaceDeclaration) {
    interfaceDeclaration = sourceFile.addInterface({
      name: interfaceName,
    });
  }
  interfaceDeclaration.set(structure);
  return interfaceDeclaration;
}
