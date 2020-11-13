import {
  SourceFile,
  VariableDeclaration
} from 'ts-morph';

export function GetVariableDeclaration(sourceFile: SourceFile, name: string): VariableDeclaration | null {
  const variableStatement = sourceFile.getVariableStatement(name);
  if (variableStatement) {
    return variableStatement.getDeclarations()[ 0 ] ?? null;
  }
  return null;
}
