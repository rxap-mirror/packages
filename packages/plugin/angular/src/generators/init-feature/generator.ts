import { Tree } from '@nx/devkit';
import {
  CoerceAppNavigation,
  CoerceLayoutRoutes,
  CoerceRoutes,
} from '@rxap/ts-morph';
import { dasherize } from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { InitFeatureGeneratorSchema } from './schema';

export async function initFeatureGenerator(
  tree: Tree,
  options: InitFeatureGeneratorSchema,
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);

  if (!projectSourceRoot) {
    throw new Error(`Project source root not found for project ${ options.project }`);
  }

  TsMorphAngularProjectTransform(tree, {
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
          path: ['']
        }
      ]
    });
    if (options.navigation) {
      CoerceAppNavigation(navigationSourceFile, {
        itemList: [{
          routerLink: [ '/', options.name ],
          label: options.navigation.label,
          icon: options.navigation.icon
        }],
        overwrite: options.overwrite,
      });
    }
  }, [ 'app/layout.routes.ts?', `feature/${dasherize(options.name)}/routes.ts?`, 'app/app.navigation.ts?' ]);
}

export default initFeatureGenerator;
