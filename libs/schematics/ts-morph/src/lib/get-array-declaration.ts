import {
  SourceFile,
  VariableDeclaration
} from 'ts-morph';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { AssertArrayLiteralExpression } from './is-array-literal-expression';

export function GetArrayDeclaration(
  sourceFile: SourceFile,
  arrayName: string,
  type: string = 'any[]'
): VariableDeclaration {

  const arrayDeclaration = CoerceVariableDeclaration(
    sourceFile,
    arrayName,
    {
      initializer: '[]',
      type
    }
  );

  AssertArrayLiteralExpression(arrayDeclaration.getInitializer(), arrayName);

  return arrayDeclaration;

}
