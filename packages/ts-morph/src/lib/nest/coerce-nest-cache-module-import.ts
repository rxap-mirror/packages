import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

export type CoerceNestCacheModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

export function CoerceNestCacheModuleImport(
  sourceFile: SourceFile,
  options: CoerceNestCacheModuleImportOptions,
) {
  CoerceNestModuleImport(
    sourceFile, {
      ...options,
      moduleName: 'CacheModule',
      structures: [
        {
          moduleSpecifier: '@nestjs/cache-manager',
          namedImports: [ 'CacheModule' ],
        },
        {
          moduleSpecifier: '@rxap/nest-utilities',
          namedImports: [ 'CacheModuleOptionsLoader' ],
        }
      ],
      importWriter: w => {
        w.writeLine('CacheModule.registerAsync(');
        Writers.object({
          useClass: 'CacheModuleOptionsLoader',
        })(w);
        w.write(')');
      },
    },
  );
}
