import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

/**
 * Options for coercing the CacheModule import.
 */
export type CoerceNestCacheModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

/**
 * Coerces the CacheModule import in a NestJS module.
 * Registers `CacheModule` asynchronously using `CacheModuleOptionsLoader`.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the import.
 */
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
          isGlobal: 'true',
          useClass: 'CacheModuleOptionsLoader',
        })(w);
        w.write(')');
      },
    },
  );
}
