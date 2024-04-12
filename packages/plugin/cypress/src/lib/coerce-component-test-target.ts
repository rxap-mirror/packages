import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';

export function coerceComponentTestTarget(tree: Tree, projectName: string, project: ProjectConfiguration) {

  CoerceTarget(project, 'component-test', {});

}
