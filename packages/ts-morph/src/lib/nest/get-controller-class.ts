import {
  classify,
  CoerceSuffix,
} from '@rxap/utilities';
import { SourceFile } from 'ts-morph';
import { GetClass } from '../get-class';

/**
 * Gets a NestJS controller class from a source file.
 *
 * @param sourceFile - The source file to search.
 * @param name - Optional name of the controller to find.
 * @returns The controller class declaration.
 */
export function GetControllerClass(sourceFile: SourceFile, name?: string) {
  return GetClass(sourceFile, classDeclaration => {
    if (classDeclaration.getDecorator(declaration => declaration.getName() === 'Controller')) {
      if (name) {
        return classDeclaration.getName() === CoerceSuffix(classify(name), 'Controller');
      }
      return true;
    }
    return false;
  });
}
