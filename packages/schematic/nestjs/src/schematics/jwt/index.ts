import { chain } from '@angular-devkit/schematics';
import {
  AddNestModuleImport,
  AddNestModuleProvider,
  CoerceImports,
  CoerceNestModule,
} from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { Writers } from 'ts-morph';
import { JwtSchematicSchema } from './schema';

export default function (options: JwtSchematicSchema) {
  return () => {
    return chain([
      CoerceNestModule({
        project: options.project,
        name: 'app',
        tsMorphTransform: (_, sourceFile) => {
          AddNestModuleProvider(sourceFile, 'JwtGuardProvider', [
            {
              namedImports: [ 'JwtGuardProvider' ],
              moduleSpecifier: '@rxap/nest-jwt',
            },
          ]);
          AddNestModuleImport(
            sourceFile,
            'JwtModule',
            [
              {
                namedImports: [ 'JwtModule' ],
                moduleSpecifier: '@nestjs/jwt',
              },
            ],
            w => {
              w.writeLine('JwtModule.registerAsync(');
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
      AddPackageJsonDependencyRule('@rxap/nest-jwt', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@nestjs/jwt', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);
  };
}
