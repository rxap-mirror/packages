import {
  ClassDeclaration,
  MethodDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export function CoerceClassMethod(
  classDeclaration: ClassDeclaration,
  methodName: string,
  methodStructure: Omit<OptionalKind<MethodDeclarationStructure>, 'name'> = {},
): MethodDeclaration {
  let methodDeclaration = classDeclaration.getMethod(methodName);
  if (!methodDeclaration) {
    methodDeclaration = classDeclaration.addMethod({
      ...methodStructure,
      name: methodName,
    });
  }
  return methodDeclaration;
}
