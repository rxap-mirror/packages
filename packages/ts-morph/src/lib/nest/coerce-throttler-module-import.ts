import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceNestModuleImport } from './coerce-nest-module-import';

export function CoerceThrottlerModuleImport(sourceFile: SourceFile) {
  CoerceNestModuleImport(
    sourceFile, {
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
              ttl: 'config.getOrThrow(\'THROTTLER_TTL\')',
              limit: 'config.getOrThrow(\'THROTTLER_LIMIT\')',
            })(w);
            w.write(')');
          },
          ttl: '1',
          limit: '10',
        })(w);
        w.write(')');
      },
    },
  );
}
