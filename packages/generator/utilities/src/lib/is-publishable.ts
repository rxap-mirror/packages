import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';

export function IsPublishable(tree: Tree, project: ProjectConfiguration) {
  return IsBuildable(project) && tree.exists(join(project.root, 'package.json'));
}
