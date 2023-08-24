import {
  ClassDeclaration,
  Decorator,
  Node,
} from 'ts-morph';

export function GetClassDecoratorArguments(
  classDeclaration: ClassDeclaration,
  findFunction: (declaration: Decorator) => boolean,
): Node[];
export function GetClassDecoratorArguments(
  classDeclaration: ClassDeclaration,
  name: string,
): Node[];
export function GetClassDecoratorArguments(
  classDeclaration: ClassDeclaration,
  nameOrFindFunction: string | ((declaration: Decorator) => boolean),
): Node[] {

  let decorator: Decorator | undefined;

  if (typeof nameOrFindFunction === 'string') {
    decorator = classDeclaration.getDecorator(nameOrFindFunction);
  } else {
    decorator = classDeclaration.getDecorator(nameOrFindFunction);
  }

  return decorator?.getArguments() ?? [];

}
