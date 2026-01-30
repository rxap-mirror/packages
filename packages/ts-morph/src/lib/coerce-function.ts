import {
  FunctionDeclarationStructure,
  SourceFile,
} from 'ts-morph';

/**
 * Coerces a function declaration in a source file.
 * If the function exists, it returns it. Otherwise, it creates it.
 *
 * @param sourceFile - The source file to look in or add to.
 * @param name - The name of the function.
 * @param structure - Optional structure to apply to the function.
 * @returns The existing or created function declaration.
 */
export function CoerceFunction(
  sourceFile: SourceFile,
  name: string,
  structure: Omit<Partial<FunctionDeclarationStructure>, 'name'> = {},
) {
  const functionDeclaration = sourceFile.getFunction(name) || sourceFile.addFunction({ name });
  functionDeclaration.set(structure);
  return functionDeclaration;
}
