import { Tree } from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import {
  CoerceLayoutRoutes,
  CoerceRoutes,
} from '@rxap/ts-morph';
import { dasherize } from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
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
  }, (_, [ layoutSourceFile, featureSourceFile ]) => {
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
  }, [ 'app/layout.routes.ts?', `feature/${dasherize(options.name)}/routes.ts?` ]);
}

export default initFeatureGenerator;
