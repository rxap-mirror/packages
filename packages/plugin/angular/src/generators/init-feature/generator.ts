import {
  generateFiles,
  Tree,
} from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import * as path from 'path';
import { AddRoute } from '../../lib/add-route';
import { InitFeatureGeneratorSchema } from './schema';

export async function initFeatureGenerator(
  tree: Tree,
  options: InitFeatureGeneratorSchema,
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  generateFiles(tree, path.join(__dirname, 'files'), projectSourceRoot, { name: options.name });
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, (_, [ sourceFile ]) => {
    AddRoute(sourceFile, {
      path: options.name,
      loadChildren: '../feature/' + options.name + '/routes',
    }, [ '' ]);
  }, [ 'app/layout.routes.ts' ]);
}

export default initFeatureGenerator;
