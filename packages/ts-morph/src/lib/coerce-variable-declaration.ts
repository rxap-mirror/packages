import {
  OptionalKind,
  SourceFile,
  VariableDeclaration,
  VariableDeclarationKind,
  VariableDeclarationStructure,
  VariableStatementStructure,
} from 'ts-morph';

/**
 * Coerces a variable declaration in a source file.
 * If the variable statement exists, it returns the declaration. Otherwise, it creates it.
 *
 * @param sourceFile - The source file to look in or add to.
 * @param name - The name of the variable.
 * @param defaultDeclaration - Default structure for the variable declaration.
 * @param variableStatementStructure - Optional structure for the variable statement (e.g. export, const).
 * @returns The existing or created variable declaration.
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
