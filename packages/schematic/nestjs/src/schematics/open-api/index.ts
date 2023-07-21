import { chain } from '@angular-devkit/schematics';
import {
  AddNestModuleImport,
  CoerceImports,
  CoerceNestModule,
} from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { Writers } from 'ts-morph';
import { OpenApiSchematicSchema } from './schema';

export default function (options: OpenApiSchematicSchema) {
  return () => {
    return chain([
      CoerceNestModule({
        project: options.project,
        name: 'app',
        tsMorphTransform: (_, sourceFile) => {
          AddNestModuleImport(
            sourceFile,
            'OpenApiModule',
            [
              {
                namedImports: [ 'OpenApiModule' ],
                moduleSpecifier: '@rxap/nest-open-api',
              },
            ],
            w => {
              w.writeLine('OpenApiModule.registerAsync(');
              Writers.object({
                inject: '[ ConfigService ]',
                useFactory: '(config: ConfigService) => ({})',
              })(w);
              w.write(')');
            },
          );
          CoerceImports(sourceFile, {
            moduleSpecifier: '@nestjs/config',
            namedImports: [ 'ConfigService' ],
          });
        },
      }),
      AddPackageJsonDependencyRule('@rxap/nest-open-api', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);
  };
}
