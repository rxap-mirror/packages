import { SourceFile } from 'ts-morph';
import { IsNestModuleClass } from './is-nest-module-class';

/**
 * Checks if a source file contains a NestJS module class.
 *
 * @param file - The source file to check.
 * @returns True if it contains a NestJS module class.
 */
export function HasNestModuleClass(file: SourceFile): boolean {
  return !!file.getClass(IsNestModuleClass) &&
    !!file.getImportDeclaration(importDeclaration =>
      importDeclaration.getModuleSpecifierValue() === '@nestjs/common' &&
      !!importDeclaration.getNamedImports().find(namedImport => namedImport.getName() === 'Module'),
    );
}
