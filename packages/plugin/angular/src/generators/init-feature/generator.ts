import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import {
  CoerceAppNavigation,
  CoerceLayoutRoutes,
  CoerceRoutes,
} from '@rxap/ts-morph';
import {
  dasherize,
  DeleteProperties,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitFeatureGeneratorSchema } from './schema';

export async function initFeatureGenerator(
  tree: Tree,
  options: InitFeatureGeneratorSchema,
) {
  options.name = dasherize(options.name);
  console.log('angular init feature generator:', options);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);

  if (!projectSourceRoot) {
    throw new Error(`Project source root not found for project ${ options.project }`);
  }

  GenerateSerializedSchematicFile(
    tree,
    join(GetProjectRoot(tree, options.project), 'feature', options.name),
    '@rxap/plugin-angular',
    'init-feature',
    DeleteProperties(options, [ 'project', 'overwrite' ]),
  );

  await TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, (_, [ layoutSourceFile, featureSourceFile, navigationSourceFile ]) => {
    CoerceRoutes(featureSourceFile);
    CoerceLayoutRoutes(layoutSourceFile, {
      itemList: [
        {
          route: {
            path: options.name,
            loadChildren: '../feature/' + options.name + '/routes',
          },
          component: 'LayoutComponent'
        }
      ],
      withStatusCheckGuard: options.apiStatusCheck,
    });
    if (options.navigation) {
      CoerceAppNavigation(navigationSourceFile, {
        itemList: [{
          routerLink: [ '/', options.name ],
          label: options.navigation.label,
          icon: options.navigation.icon as any
        }],
        overwrite: options.overwrite,
      });
    }
  }, [ 'app/layout.routes.ts?', `feature/${dasherize(options.name)}/routes.ts?`, 'app/app.navigation.ts?' ]);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initFeatureGenerator;
