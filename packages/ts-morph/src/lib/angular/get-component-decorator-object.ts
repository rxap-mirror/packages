import { GetComponentClass } from '@rxap/ts-morph';
import {
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
  Writers,
} from 'ts-morph';

export function GetComponentDecoratorObject(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration
): ObjectLiteralExpression {

  const classDeclaration = sourceFileOrClassDeclaration instanceof ClassDeclaration ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);


  const componentDecorator = classDeclaration.getDecorator('Component')!;
  let componentOptions = componentDecorator.getArguments()[0];

  if (!componentOptions) {
    componentOptions = componentDecorator.addArgument(Writers.object({}));
  }

  if (!(componentOptions instanceof ObjectLiteralExpression)) {
    throw new Error('The Component options is not an object literal expression');
  }

  return componentOptions;
}
