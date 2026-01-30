import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

/**
 * Options for coercing the ConfigModule import.
 */
export type CoerceNestConfigModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

/**
 * Coerces the ConfigModule import in a NestJS module.
 * Registers `ConfigModule.forRoot` with `isGlobal: true` and `VALIDATION_SCHEMA`.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the import.
 */
export function CoerceNestConfigModuleImport(sourceFile: SourceFile, options: CoerceNestConfigModuleImportOptions) {
  CoerceNestModuleImport(
    sourceFile, {
      ...options,
      moduleName: 'ConfigModule',
      structures: [
        {
          moduleSpecifier: '@nestjs/config',
          namedImports: [ 'ConfigModule' ],
        },
        {
          moduleSpecifier: './app.config',
          namedImports: [ 'VALIDATION_SCHEMA' ],
        },
      ],
      importWriter: w => {
        w.writeLine('ConfigModule.forRoot(');
        Writers.object({
          isGlobal: 'true',
          validationSchema: 'VALIDATION_SCHEMA',
        })(w);
        w.write(')');
      },
    },
  );
}
