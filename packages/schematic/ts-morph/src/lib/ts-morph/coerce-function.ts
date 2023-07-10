import {
  FunctionDeclarationStructure,
  SourceFile,
} from 'ts-morph';

export function CoerceFunction(
  sourceFile: SourceFile,
  name: string,
  structure: Omit<Partial<FunctionDeclarationStructure>, 'name'> = {},
) {
  const functionDeclaration = sourceFile.getFunction(name) || sourceFile.addFunction({name});
  functionDeclaration.set(structure);
  return functionDeclaration;
}
