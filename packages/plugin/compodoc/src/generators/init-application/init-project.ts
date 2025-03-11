import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  coerceIdeaExcludeFolders,
  isJetbrainsProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init compodoc application project: ${ projectName }`);

  CoerceCompodocTsConfig(tree, projectName);

  CoerceGitIgnore(tree, projectName);

  if (isJetbrainsProject(tree)) {
    await coerceIdeaExcludeFolders(tree, [
      join(project.root, 'docs'),
    ]);
  }

}
