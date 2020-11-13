import {
  ArrayLiteralExpression,
  SourceFile
} from 'ts-morph';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';

export function AddToArray(sourceFile: SourceFile, arrayName: string, value: string, type: string) {

  const providerArray = CoerceVariableDeclaration(
    sourceFile,
    arrayName,
    {
      name:        arrayName,
      initializer: '[]',
      type
    }
  ).getInitializer();

  if (providerArray instanceof ArrayLiteralExpression) {

    if (providerArray.getElements().findIndex(element => element.getFullText().trim() === value) === -1) {
      providerArray.addElement(value);
    }

  } else {
    throw new Error('The options provider value is not an array literal expression!');
  }

}
