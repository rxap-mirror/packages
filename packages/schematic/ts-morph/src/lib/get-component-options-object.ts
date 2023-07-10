import {ObjectLiteralExpression, SourceFile, Writers} from 'ts-morph';

export function GetComponentOptionsObject(sourceFile: SourceFile): ObjectLiteralExpression {


  const classWithComponent = sourceFile.getClasses().find(cls => cls.getDecorator('Component'));

  if (!classWithComponent) {
    throw new Error('Could not find class with Component decorator!');
  }

  const componentDecorator = classWithComponent.getDecorator('Component')!;
  let componentOptions = componentDecorator.getArguments()[0];

  if (!componentOptions) {
    componentOptions = componentDecorator.addArgument(Writers.object({}));
  }

  if (!(componentOptions instanceof ObjectLiteralExpression)) {
    throw new Error('The Component options is not an object literal expression');
  }

  return componentOptions;
}
