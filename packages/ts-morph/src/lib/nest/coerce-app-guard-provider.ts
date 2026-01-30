import { SourceFile } from 'ts-morph';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

/**
 * Coerces the APP_GUARD provider in a NestJS module.
 * Adds the ThrottlerGuard as a global guard.
 *
 * @param sourceFile - The source file containing the module.
 */
export function CoerceAppGuardProvider(sourceFile: SourceFile) {
  CoerceNestModuleProvider(
    sourceFile,
    {
      providerObject: {
        provide: 'APP_GUARD',
        useClass: 'ThrottlerGuard',
      },
      structures: [
        {
          namedImports: [ 'APP_GUARD' ],
          moduleSpecifier: '@nestjs/core',
        },
        {
          namedImports: [ 'ThrottlerGuard' ],
          moduleSpecifier: '@nestjs/throttler',
        },
      ],
    },
  );
}
