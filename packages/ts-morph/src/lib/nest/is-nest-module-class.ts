import { ClassDeclaration } from 'ts-morph';

/**
 * Checks if a class declaration is a NestJS module.
 *
 * @param declaration - The class declaration to check.
 * @returns True if it is a NestJS module.
 */
export function IsNestModuleClass(declaration: ClassDeclaration): boolean {
  return !!declaration.getDecorator(declaration => declaration.getFullName() === 'Module');
}
