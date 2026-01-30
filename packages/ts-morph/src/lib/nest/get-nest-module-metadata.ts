import {
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { GetClassDecoratorArguments } from '../get-class-decorator-arguments';
import { IsNestModuleClass } from './is-nest-module-class';

/**
 * Gets the metadata object of a NestJS module.
 *
 * @param sourceFile - The source file containing the module.
 * @returns The object literal expression of the module metadata.
 */
export function GetNestModuleMetadata(sourceFile: SourceFile): ObjectLiteralExpression {

  const classDeclaration = sourceFile.getClass(IsNestModuleClass);

  if (!classDeclaration) {
    throw new Error(`The sourceFile '${ sourceFile.getFilePath() }' does not have a NestJs Module class.`);
  }

  const [ metadata ] = GetClassDecoratorArguments(classDeclaration, 'Module');

  if (!(metadata.isKind(SyntaxKind.ObjectLiteralExpression))) {
    throw new Error(`The NestJs Module class in the sourceFile '${ sourceFile.getFilePath() }' does not have the @Module decorator with a metadata object literal expression.`);
  }

  return metadata;

}
