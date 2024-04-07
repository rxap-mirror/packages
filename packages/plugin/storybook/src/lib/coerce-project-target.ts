import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceTarget,
  GetProjectRoot,
  IsLibraryProject,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from '../generators/init-library/schema';

export async function coerceProjectTarget(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  const projectRoot = GetProjectRoot(tree, projectName);
  CoerceTarget(project, 'storybook', {
    options: {
      compodoc: true,
      compodocArgs: [
        '-e',
        'json',
        '-d',
        projectRoot,
      ],
    },
  }, Strategy.OVERWRITE);
  CoerceTarget(project, 'build-storybook', {
    options: {
      compodoc: true,
      compodocArgs: [
        '-e',
        'json',
        '-d',
        projectRoot,
      ],
    },
    defaultConfiguration: 'ci'
  }, Strategy.OVERWRITE);
  if (IsLibraryProject(project)) {
    project.targets['build-storybook'].options.styles ??= [];
    CoerceArrayItems(project.targets['build-storybook'].options.styles, ['shared/angular/styles/_index.scss']);
  }

}
