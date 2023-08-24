import { Tree } from '@nx/devkit';
import {
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
          moduleName: 'JwtModule',
          structures: [
            {
              namedImports: [ 'JwtModule' ],
              moduleSpecifier: '@nestjs/jwt',
            },
            {
              moduleSpecifier: '@nestjs/config',
              namedImports: [ 'ConfigService' ],
            },
          ],
          importWriter: w => {
            w.writeLine('JwtModule.registerAsync(');
            Writers.object({
              inject: '[ ConfigService ]',
              useFactory: '(config: ConfigService) => ({})',
            })(w);
            w.write(')');
          },
        },
      );

    },
    [ '/app/app.module.ts' ],
  );

}

export async function jwtGenerator(tree: Tree, options: JwtGeneratorSchema) {
  UpdateAppModule(tree, options);
  await AddPackageJsonDependency(tree, '@rxap/nest-jwt', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/jwt', 'latest', { soft: true });
}

export default jwtGenerator;
