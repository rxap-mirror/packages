import {
  OptionalKind,
  SourceFile,
  TypeAliasDeclarationStructure,
} from 'ts-morph';

export function CoerceTypeAlias(
  sourceFile: SourceFile,
  name: string,
  structure: Omit<OptionalKind<TypeAliasDeclarationStructure>, 'name'>,
) {
  let typeAliasDeclaration = sourceFile.getTypeAlias(name);
  if (!typeAliasDeclaration) {
    typeAliasDeclaration = sourceFile.addTypeAlias({
      ...structure,
      name,
    });
  }
  return typeAliasDeclaration;
}