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
/**
 * Gets the arguments of a class decorator.
 *
 * @param classDeclaration - The class declaration to get the decorator from.
 * @param findFunction - A function to find the decorator or the name of the decorator.
 * @returns An array of arguments (Nodes).
 */
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
