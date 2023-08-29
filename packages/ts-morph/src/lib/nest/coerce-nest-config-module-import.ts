import {
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  CoerceNestModuleImport,
  CoerceNestModuleImportOptions,
} from './coerce-nest-module-import';

export type CoerceNestConfigModuleImportOptions = Omit<CoerceNestModuleImportOptions, 'moduleName'>;

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
