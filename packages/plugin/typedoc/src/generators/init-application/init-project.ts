import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { CoerceTypedocTarget } from '../../lib/coerce-typedoc-target';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init typedoc application project: ${ projectName }`);

  CoerceTypedocTarget(tree, projectName, project);

  CoerceGitIgnore(tree, projectName);

}
