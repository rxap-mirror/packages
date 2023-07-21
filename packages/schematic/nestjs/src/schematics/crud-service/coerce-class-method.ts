import {
  ClassDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export function CoerceClassMethod(
  classDeclaration: ClassDeclaration,
  methodName: string,
  methodStructure: Omit<OptionalKind<MethodDeclarationStructure>, 'name'> = {},
): void {

  if (!classDeclaration.getMethod(methodName)) {
    classDeclaration.addMethod({
      ...methodStructure,
      name: methodName,
    });
  }

}
