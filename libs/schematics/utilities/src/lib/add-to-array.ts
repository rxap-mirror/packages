import {
  ArrayLiteralExpression,
  SourceFile
} from 'ts-morph';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';

/**
 * Adds the value to the array with the name arrayName
 *
 * @param sourceFile
 * @param arrayName
 * @param value
 * @param type The variable type of the array declaration
 * @param overwrite
 * @constructor
 */
export function AddToArray(
  sourceFile: SourceFile,
  arrayName: string,
  value: string,
  type: string       = 'any[]',
  overwrite: boolean = false
) {

  const providerArray = CoerceVariableDeclaration(
    sourceFile,
    arrayName,
    {
      initializer: '[]',
      type
    }
  ).getInitializer();

  if (providerArray instanceof ArrayLiteralExpression) {

    const index = providerArray.getElements().findIndex(element => element.getFullText().trim() === value);

    if (overwrite && index !== -1) {
      providerArray.removeElement(index);
    }

    if (overwrite || index === -1) {
      providerArray.addElement(value);
    }

  } else {
    throw new Error('The options provider value is not an array literal expression!');
  }

}
