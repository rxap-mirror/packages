import { SourceFile } from 'ts-morph';
import { IsNestModuleClass } from './is-nest-module-class';

export function HasNestModuleClass(file: SourceFile): boolean {
  return !!file.getClass(IsNestModuleClass) &&
    !!file.getImportDeclaration(importDeclaration =>
      importDeclaration.getModuleSpecifierValue() === '@nestjs/common' &&
      !!importDeclaration.getNamedImports().find(namedImport => namedImport.getName() === 'Module'),
    );
}
