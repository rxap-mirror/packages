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
          moduleSpecifier: '@rxap/nest-utilities',
          namedImports: [ 'ThrottlerModuleOptionsLoader' ],
        }
      ],
      importWriter: w => {
        w.writeLine('ThrottlerModule.forRootAsync(');
        Writers.object({
          useClass: 'ThrottlerModuleOptionsLoader',
        })(w);
        w.write(')');
      },
    },
  );
}
