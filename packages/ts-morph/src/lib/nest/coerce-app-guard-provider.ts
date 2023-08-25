import { SourceFile } from 'ts-morph';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

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
