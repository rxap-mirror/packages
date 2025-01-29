import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function updateGitIgnore(project: ProjectConfiguration, tree: Tree, options: InitApplicationGeneratorSchema) {

  if (options.i18n) {

    if (!project.sourceRoot) {
      throw new Error(`The project ${ project.name } has no source root`);
    }

    CoerceIgnorePattern(tree, join(project.sourceRoot, '.gitignore'), [
      '/i18n',
    ]);
  }

}
