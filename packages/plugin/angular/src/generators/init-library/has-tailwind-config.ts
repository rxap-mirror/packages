import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';

export function hasTailwindConfig(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.root, 'tailwind.config.js'));
}
