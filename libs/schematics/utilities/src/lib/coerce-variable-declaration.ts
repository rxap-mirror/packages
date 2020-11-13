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
  defaultDeclaration: OptionalKind<VariableDeclarationStructure>
): VariableDeclaration {

  let variableStatement = sourceFile.getVariableStatement(name);
  if (!variableStatement) {
    variableStatement = sourceFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [ defaultDeclaration ]
    });
  }

  let variableDeclaration = variableStatement.getDeclarations()[ 0 ];

  if (!variableDeclaration) {
    variableDeclaration = variableStatement.addDeclaration(defaultDeclaration);
  }

  return variableDeclaration;
}
