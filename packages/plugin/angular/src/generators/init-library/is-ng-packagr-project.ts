import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';

export function isNgPackagrProject(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.root, 'ng-package.json'));
}
