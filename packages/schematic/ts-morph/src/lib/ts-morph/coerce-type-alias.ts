import {
  OptionalKind,
  SourceFile,
  TypeAliasDeclarationStructure,
  WriterFunction,
} from 'ts-morph';

export function CoerceTypeAlias(
  sourceFile: SourceFile,
  typeName: string,
  structure: Omit<OptionalKind<TypeAliasDeclarationStructure>, 'name' | 'type'> & {
    type?: string | WriterFunction
  } = {},
) {
  let typeDeclaration = sourceFile.getTypeAlias(typeName);
  if (!typeDeclaration) {
    typeDeclaration = sourceFile.addTypeAlias({
      type: 'unknown',
      ...structure,
      name: typeName,
    });
  }
  return typeDeclaration;
}
