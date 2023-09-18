import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

export type CoerceNestThrottlerModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

export function CoerceNestThrottlerModuleImport(
  sourceFile: SourceFile,
  options: CoerceNestThrottlerModuleImportOptions,
) {
  CoerceNestModuleImport(
    sourceFile, {
      ...options,
      moduleName: 'ThrottlerModule',
      structures: [
        {
          moduleSpecifier: '@nestjs/throttler',
          namedImports: [ 'ThrottlerModule' ],
        },
        {
          moduleSpecifier: '@nestjs/config',
          namedImports: [ 'ConfigModule', 'ConfigService' ],
        },
      ],
      importWriter: w => {
        w.writeLine('ThrottlerModule.forRootAsync(');
        Writers.object({
          imports: '[ ConfigModule ]',
          inject: '[ ConfigService ]',
          useFactory: w => {
            w.write('(config: ConfigService) => (');
            Writers.object({
              throttlers: w => {
                w.write('[');
                Writers.object({
                  ttl: 'config.getOrThrow(\'THROTTLER_TTL\')',
                  limit: 'config.getOrThrow(\'THROTTLER_LIMIT\')',
                });
                w.write(']');
              },
            })(w);
            w.write(')');
          },
        })(w);
        w.write(')');
      },
    },
  );
}
