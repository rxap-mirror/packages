import { SourceFile } from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestModuleImport } from './coerce-nest-module-import';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

export function CoerceHealthModule(sourceFile: SourceFile) {

  CoerceNestModule(sourceFile, {
    name: 'HealthModule',
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

  CoerceNestModuleProvider(sourceFile, {
    providerObject: 'Logger',
    structures: [
      {
        moduleSpecifier: '@nestjs/common',
        namedImports: [ 'Logger' ],
      },
    ],
  });

  CoerceImports(sourceFile, {
    moduleSpecifier: '@nestjs/common',
    namedImports: [ 'Module' ],
  });

}
