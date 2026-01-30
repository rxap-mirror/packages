import {
  CoerceImports,
  CoerceNestModuleImport,
} from '@rxap/ts-morph';
import { SourceFile } from 'ts-morph';

/**
 * Coerces the EnvironmentModule import in a NestJS module.
 * Registers `EnvironmentModule` with the environment object.
 *
 * @param sourceFile - The source file containing the module.
 */
export function CoerceNestEnvironmentModule(sourceFile: SourceFile) {
  CoerceNestModuleImport(sourceFile, {
    moduleName: 'EnvironmentModule',
    importWriter: w => w.write('EnvironmentModule.register(environment)')
  });
  CoerceImports(sourceFile, [
    {
      moduleSpecifier: '@rxap/nest-utilities',
      namedImports: [ 'EnvironmentModule' ],
    },
    {
      namedImports: [ 'environment' ],
      moduleSpecifier: '../environments/environment',
    },
  ]);
}
