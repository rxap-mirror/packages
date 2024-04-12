import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';

export function coerceComponentTestTarget(tree: Tree, projectName: string, project: ProjectConfiguration) {

  CoerceTarget(project, 'open-component-test', {
    executor: project.targets['component-test'].executor,
    options: {
      ...project.targets['component-test'].options,
      watch: true,
    }
  });

}
