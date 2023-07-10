import { ClassDeclaration } from 'ts-morph';

export function CoerceClassImplementation(classDeclaration: ClassDeclaration, implementation: string) {
  if (!classDeclaration.getImplements().some(impl => impl.getText() === implementation)) {
    classDeclaration.addImplements(implementation);
  }
}
