import {
  ClassDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export function AddClassMethod(
  classDeclaration: ClassDeclaration,
  name: string,
  structure: Omit<OptionalKind<MethodDeclarationStructure>, 'name'>,
  overwrite?: boolean,
) {

  let methodDeclaration = classDeclaration.getMethod(name)

  if (methodDeclaration) {

    if (overwrite) {
      methodDeclaration.remove();
    } else {
      throw new Error('Can not add class method - a method with the same name already exists. Set the overwrite parameter to true or use CoerceClassMethod');
    }

  }

  methodDeclaration = classDeclaration.addMethod({
    ...structure,
    name,
  });

  return methodDeclaration;

}
