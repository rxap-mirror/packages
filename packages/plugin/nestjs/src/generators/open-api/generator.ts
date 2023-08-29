import { Tree } from '@nx/devkit';
import { CoerceNestModuleImport } from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
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
              namedImports: [ 'OpenApiModule' ],
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
              inject: '[ ConfigService ]',
              imports: '[ ConfigModule ]',
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

export async function openApiGenerator(
  tree: Tree,
  options: OpenApiGeneratorSchema,
) {
  UpdateAppModule(tree, options);
  await AddPackageJsonDependency(tree, '@rxap/nest-open-api', 'latest', { soft: true });
}

export default openApiGenerator;
