import {
  generateFiles,
  Tree,
} from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import { CoerceLayoutRoutes } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { join } from 'path';
import { InitFeatureGeneratorSchema } from './schema';

export async function initFeatureGenerator(
  tree: Tree,
  options: InitFeatureGeneratorSchema,
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);

  if (!projectSourceRoot) {
    throw new Error(`Project source root not found for project ${ options.project }`);
  }

  generateFiles(tree, join(__dirname, 'files'), projectSourceRoot, { name: options.name });
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, (_, [ sourceFile ]) => {
    CoerceLayoutRoutes(sourceFile, {
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
  }, [ 'app/layout.routes.ts' ]);
}

export default initFeatureGenerator;
