import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import {
  FindByNameFunction,
  FindFunction,
} from './find-function';

export function GetClass(sourceFile: SourceFile, nameOrFindFunction?: string | FindFunction<ClassDeclaration>) {

  if (nameOrFindFunction) {
    let findFunction: FindFunction<ClassDeclaration>;

    if (typeof nameOrFindFunction === 'string') {
      findFunction = FindByNameFunction<any, ClassDeclaration>({ name: nameOrFindFunction });
    } else {
      findFunction = nameOrFindFunction;
    }

    return sourceFile.getClassOrThrow(findFunction);
  }

  const classDeclarationList = sourceFile.getClasses();

  if (classDeclarationList.length === 0) {
    throw new Error(`No class declaration found in file: ${ sourceFile.getFilePath() }`);
  }

  if (classDeclarationList.length !== 1) {
    throw new Error(`Multiple class declarations found in file: ${ sourceFile.getFilePath() }`);
  }

  return classDeclarationList[0];

}
