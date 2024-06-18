import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function updateGitIgnore(tree: Tree, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  if (!options.standalone) {
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'package.json' ]);
  }
}
