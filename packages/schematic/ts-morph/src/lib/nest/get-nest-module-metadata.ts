import {
  ObjectLiteralExpression,
  SourceFile,
} from 'ts-morph';
import { IsNestModuleClass } from './is-nest-module-class';
import { GetClassDecoratorArguments } from '../get-class-decorator-arguments';

export function GetNestModuleMetadata(sourceFile: SourceFile): ObjectLiteralExpression {

  const classDeclaration = sourceFile.getClass(IsNestModuleClass);

  if (!classDeclaration) {
    throw new Error(`The sourceFile '${ sourceFile.getFilePath() }' does not have a NestJs Module class.`);
  }

  const [ metadata ] = GetClassDecoratorArguments(classDeclaration, 'Module');

  if (!(metadata instanceof ObjectLiteralExpression)) {
    throw new Error(`The NestJs Module class in the sourceFile '${ sourceFile.getFilePath() }' does not have the @Module decorator with a metadata object literal expression.`);
  }

  return metadata;

}
