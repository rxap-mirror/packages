import {
  VariableDeclarationKind,
  ArrayLiteralExpression,
  SourceFile
} from 'ts-morph';

export function AddToArray(sourceFile: SourceFile, arrayName: string, value: string, type: string) {

  let providers = sourceFile.getVariableStatement(arrayName);
  if (!providers) {
    providers = sourceFile.addVariableStatement({
      isExported:      true,
      declarationKind: VariableDeclarationKind.Const,
      declarations:    [
        {
          name:        arrayName,
          initializer: '[]',
          type
        }
      ]
    });
  }

  let providerDeclaration = providers.getDeclarations()[ 0 ];

  if (!providerDeclaration) {
    providerDeclaration = providers.addDeclaration({
      name:        arrayName,
      initializer: '[]',
      type
    });
  }

  const providerArray = providerDeclaration.getInitializer();

  if (providerArray instanceof ArrayLiteralExpression) {

    if (providerArray.getElements().findIndex(element => element.getFullText().trim() === value) === -1) {
      providerArray.addElement(value);
    }

  } else {
    throw new Error('The options provider value is not an array literal expression!');
  }

}
