import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestModuleImport,
  CoerceNestModuleProvider,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { Writers } from 'ts-morph';
import { SentryGeneratorSchema } from '../sentry/schema';
import { JwtGeneratorSchema } from './schema';

function UpdateAppModule(tree: Tree, options: SentryGeneratorSchema) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceNestModuleProvider(sourceFile, {
        providerObject: 'JwtGuardProvider',
        structures: [
          {
            namedImports: [ 'JwtGuardProvider' ],
            moduleSpecifier: '@rxap/nest-jwt',
          },
        ],
      });

      CoerceNestModuleImport(
        sourceFile,
        {
          overwrite: options.overwrite,
          moduleName: 'JwtModule',
          structures: [
            {
              namedImports: [ 'JwtModule' ],
              moduleSpecifier: '@nestjs/jwt',
            },
            {
              moduleSpecifier: '@rxap/nest-jwt',
              namedImports: [ 'JwtModuleOptionsLoader' ],
            },
          ],
          importWriter: w => {
            w.writeLine('JwtModule.registerAsync(');
            Writers.object({
              global: 'true',
              useClass: 'JwtModuleOptionsLoader',
            })(w);
            w.write(')');
          },
        },
      );

    },
    [ '/app/app.module.ts' ],
  );

}

function UpdateAppConfig(tree: Tree, options: JwtGeneratorSchema, projectName: string) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceNestAppConfig(sourceFile, {
        itemList: [
          {
            name: 'JWT_SECRET',
            defaultValue: 'GenerateRandomString()',
          },
          {
            name: 'JWT_AUTH_HEADER',
            type: 'string',
            defaultValue: 'Authorization',
          },
        ],
        overwrite: options.overwrite,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'GenerateRandomString' ],
        moduleSpecifier: '@rxap/utilities',
      });

    },
    [ '/app/app.config.ts?' ],
  );

}

export async function jwtGenerator(tree: Tree, options: JwtGeneratorSchema) {
  console.log('nestjs application jwt generator:', options);
  UpdateAppModule(tree, options);
  UpdateAppConfig(tree, options, options.project);
  await AddPackageJsonDependency(tree, '@rxap/nest-jwt', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/jwt', 'latest', { soft: true });
}

export default jwtGenerator;
