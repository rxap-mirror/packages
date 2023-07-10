import {ObjectLiteralExpression, SourceFile, Writers} from 'ts-morph';

export function GetNgModuleOptionsObject(sourceFile: SourceFile): ObjectLiteralExpression {


  const classWithNgModule = sourceFile.getClasses().find(cls => cls.getDecorator('NgModule'));

  if (!classWithNgModule) {
    throw new Error('Could not find class with NgModule decorator!');
  }

  const ngModuleDecorator = classWithNgModule.getDecorator('NgModule')!;
  let ngModuleOptions = ngModuleDecorator.getArguments()[0];

  if (!ngModuleOptions) {
    ngModuleOptions = ngModuleDecorator.addArgument(Writers.object({}));
  }

  if (!(ngModuleOptions instanceof ObjectLiteralExpression)) {
    throw new Error('The NgModule options is not an object literal expression');
  }

  return ngModuleOptions;
}
