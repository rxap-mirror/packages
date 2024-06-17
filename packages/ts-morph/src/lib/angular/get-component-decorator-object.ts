import {
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
  Writers,
} from 'ts-morph';
import { GetComponentClass } from './get-component-class';

export function GetComponentDecoratorObject(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration
): ObjectLiteralExpression {

  const classDeclaration = sourceFileOrClassDeclaration.isKind(SyntaxKind.ClassDeclaration) ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);


  const componentDecorator = classDeclaration.getDecorator('Component')!;
  let componentOptions = componentDecorator.getArguments()[0];

  if (!componentOptions) {
    componentOptions = componentDecorator.addArgument(Writers.object({}));
  }

  if (!(componentOptions.isKind(SyntaxKind.ObjectLiteralExpression))) {
    throw new Error('The Component options is not an object literal expression');
  }

  return componentOptions;
}
