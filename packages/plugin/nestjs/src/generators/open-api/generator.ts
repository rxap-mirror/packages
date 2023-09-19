import { Tree } from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import {
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestModuleImport,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { join } from 'path';
import { Writers } from 'ts-morph';
import { SentryGeneratorSchema } from '../sentry/schema';
import { OpenApiGeneratorSchema } from './schema';

function UpdateAppModule(tree: Tree, options: SentryGeneratorSchema) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceNestModuleImport(
        sourceFile,
        {
          moduleName: 'OpenApiModule',
          structures: [
            {
              namedImports: [ 'OpenApiModule', 'OpenApiModuleOptionsLoader' ],
              moduleSpecifier: '@rxap/nest-open-api',
            },
            {
              moduleSpecifier: '@nestjs/config',
              namedImports: [ 'ConfigService' ],
            },
          ],
          importWriter: w => {
            w.writeLine('OpenApiModule.registerAsync(');
            Writers.object({
              isGlobal: 'true',
              useClass: 'OpenApiModuleOptionsLoader',
            })(w);
            w.write(')');
          },
        },
      );

    },
    [ '/app/app.module.ts' ],
  );

}

function UpdateAppConfig(tree: Tree, options: OpenApiGeneratorSchema) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceNestAppConfig(sourceFile, {
        itemList: [
          {
            name: 'OPEN_API_SERVER_CONFIG_FILE_PATH',
            defaultValue: `environment.production ? '/app/assets/open-api-server-config.json' : join(__dirname, 'assets/open-api-server-config.json')`,
          },
        ],
        overwrite: options.overwrite,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'environment' ],
        moduleSpecifier: '../environments/environment',
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'join' ],
        moduleSpecifier: 'path',
      });

    },
    [ '/app/app.config.ts?' ],
  );

}

export async function openApiGenerator(
  tree: Tree,
  options: OpenApiGeneratorSchema,
) {
  UpdateAppModule(tree, options);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  if (!tree.exists(join(projectSourceRoot, 'assets', 'open-api-server-config.json'))) {
    tree.write(join(projectSourceRoot, 'assets', 'open-api-server-config.json'), '[]');
  }
  UpdateAppConfig(tree, options);
  await AddPackageJsonDependency(tree, '@rxap/nest-open-api', 'latest', { soft: true });
}

export default openApiGenerator;
