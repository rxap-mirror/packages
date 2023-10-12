import {
  ArrayLiteralExpression,
  SourceFile,
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
  type = 'any[]',
  overwrite: boolean | string[] = false,
) {

  const providerArray = CoerceVariableDeclaration(
    sourceFile,
    arrayName,
    {
      initializer: '[]',
      type,
    },
  ).getInitializer();

  if (providerArray instanceof ArrayLiteralExpression) {

    let index = providerArray.getElements().findIndex(element => element.getText().trim() === value);

    if ((
          overwrite === true || (
                      Array.isArray(overwrite) && overwrite.includes('provider')
                    )
        ) && index !== -1) {
      providerArray.removeElement(index);
      index = -1;
    }

    if (index === -1) {
      providerArray.addElement(value);
    }

  } else {
    throw new Error('The options provider value is not an array literal expression!');
  }

}
