import { ClassDeclaration } from 'ts-morph';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function IsNestModuleClass(declaration: ClassDeclaration): boolean {
  return !!declaration.getDecorator(declaration => declaration.getFullName() === 'Module');
}
