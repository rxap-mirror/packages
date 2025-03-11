import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  coerceIdeaExcludeFolders,
  isJetbrainsProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { CoerceTypedocTsConfig } from '../../lib/coerce-typedoc-ts-config';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init typedoc application project: ${ projectName }`);

  CoerceTypedocTsConfig(tree, projectName);

  CoerceGitIgnore(tree, projectName);

  if (isJetbrainsProject(tree)) {
    await coerceIdeaExcludeFolders(tree, [
      join(project.root, 'compodoc'),
    ]);
  }

}
