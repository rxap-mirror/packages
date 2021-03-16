import {
  SourceFile,
  OptionalKind,
  VariableDeclaration,
  VariableDeclarationStructure,
  VariableDeclarationKind
} from 'ts-morph';

export function CoerceVariableDeclaration(
  sourceFile: SourceFile,
  name: string,
  defaultDeclaration: Omit<OptionalKind<VariableDeclarationStructure>, 'name'>
): VariableDeclaration {

  const declaration = {
    ...defaultDeclaration,
    name
  };

  let variableStatement = sourceFile.getVariableStatement(name);
  if (!variableStatement) {
    variableStatement = sourceFile.addVariableStatement({
      isExported:      true,
      declarationKind: VariableDeclarationKind.Const,
      declarations:    [ declaration ]
    });
  }

  let variableDeclaration = variableStatement.getDeclarations()[ 0 ];

  if (!variableDeclaration) {
    variableDeclaration = variableStatement.addDeclaration(declaration);
  }

  return variableDeclaration;
}
