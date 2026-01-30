import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

/**
 * Options for coercing the ThrottlerModule import.
 */
export type CoerceNestThrottlerModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

/**
 * Coerces the ThrottlerModule import in a NestJS module.
 * Registers `ThrottlerModule` asynchronously using `ThrottlerModuleOptionsLoader`.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the import.
 */
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
