import { SourceFile } from 'ts-morph';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

/**
 * Coerces the `ENVIRONMENT` provider in a NestJS module.
 * Provides the environment object as a value.
 *
 * @param sourceFile - The source file containing the module.
 */
export function CoerceNestEnvironmentProvider(sourceFile: SourceFile) {
  CoerceNestModuleProvider(
    sourceFile,
    {
      providerObject:
        {
          provide: 'ENVIRONMENT',
          useValue: 'environment',
        },
      structures: [
        {
          namedImports: [ 'ENVIRONMENT' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ 'environment' ],
          moduleSpecifier: '../environments/environment',
        },
      ],
    },
  );
}
