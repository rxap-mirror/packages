import { SourceFile } from 'ts-morph';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';

export function CoerceNestLoggerProvider(sourceFile: SourceFile) {
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
