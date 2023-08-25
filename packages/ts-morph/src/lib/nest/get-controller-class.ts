import {
  classify,
  CoerceSuffix,
} from '@rxap/utilities';
import { SourceFile } from 'ts-morph';
import { GetClass } from '../get-class';

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
