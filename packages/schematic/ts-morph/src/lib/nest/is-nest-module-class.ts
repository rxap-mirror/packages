import {ClassDeclaration} from 'ts-morph';

export function IsNestModuleClass(declaration: ClassDeclaration): boolean {
  return !!declaration.getDecorator(declaration => declaration.getFullName() === 'Module')
}
