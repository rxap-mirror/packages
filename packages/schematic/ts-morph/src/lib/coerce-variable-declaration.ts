import {
  OptionalKind,
  SourceFile,
  VariableDeclaration,
  VariableDeclarationKind,
  VariableDeclarationStructure,
  VariableStatementStructure,
} from 'ts-morph';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceVariableDeclaration(
  sourceFile: SourceFile,
  name: string,
  defaultDeclaration: Omit<OptionalKind<VariableDeclarationStructure>, 'name'> = {},
  variableStatementStructure?: Partial<Omit<OptionalKind<VariableStatementStructure>, 'declarations'>>,
): VariableDeclaration {

  const declaration = {
    ...defaultDeclaration,
    name,
  };

  let variableStatement = sourceFile.getVariableStatement(name);
  if (!variableStatement) {
    variableStatementStructure ??= {
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
    };
    variableStatementStructure.isExported ??= true;
    variableStatementStructure.declarationKind ??= VariableDeclarationKind.Const;
    variableStatement = sourceFile.addVariableStatement({
      ...variableStatementStructure,
      declarations: [ declaration ],
    });
  }

  let variableDeclaration = variableStatement.getDeclarations()[0];

  if (!variableDeclaration) {
    variableDeclaration = variableStatement.addDeclaration(declaration);
  }

  return variableDeclaration;
}
