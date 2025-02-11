import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';

export function hasIndexScss(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(GetProjectSourceRoot(project), '_index.scss'));
}
