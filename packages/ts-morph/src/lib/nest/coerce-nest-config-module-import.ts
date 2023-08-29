import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceNestModuleImport } from './coerce-nest-module-import';

export function CoerceNestConfigModuleImport(sourceFile: SourceFile) {
  CoerceNestModuleImport(
    sourceFile, {
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
