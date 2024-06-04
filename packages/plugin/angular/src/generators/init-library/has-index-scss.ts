import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';

export function hasIndexScss(tree: Tree, project: ProjectConfiguration) {

  if (!project.sourceRoot) {
    throw new Error(`The project ${ project.name } has no sourceRoot`);
  }

  return tree.exists(join(project.sourceRoot, '_index.scss'));
}
