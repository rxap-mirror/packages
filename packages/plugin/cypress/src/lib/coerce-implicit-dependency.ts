import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { HasProject } from '@rxap/workspace-utilities';

export function coerceImplicitDependency(tree: Tree, projectName: string) {

  if (!HasProject(tree, 'cypress')) {
    throw new Error('The project cypress does not exist');
  }

  const project = readProjectConfiguration(tree, 'cypress');
  project.implicitDependencies ??= [];
  CoerceArrayItems(project.implicitDependencies, [ projectName ]);
  updateProjectConfiguration(tree, 'cypress', project);

}
