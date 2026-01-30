import { SourceFile } from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestModuleImport } from './coerce-nest-module-import';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

/**
 * Coerces a HealthModule for NestJS Terminus.
 * Imports `TerminusModule`.
 *
 * @param sourceFile - The source file to add the module to.
 */
export function CoerceHealthModule(sourceFile: SourceFile) {

  CoerceNestModule(sourceFile, {
    name: 'Health',
  });

  CoerceNestModuleImport(sourceFile, {
    moduleName: 'TerminusModule',
    structures: [
      {
        moduleSpecifier: '@nestjs/terminus',
        namedImports: [ 'TerminusModule' ],
      },
    ],
  });

  CoerceImports(sourceFile, {
    moduleSpecifier: '@nestjs/common',
    namedImports: [ 'Module' ],
  });

}
