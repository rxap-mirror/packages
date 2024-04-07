import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceCompodocTarget } from '../../lib/coerce-compodoc-target';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init compodoc application project: ${ projectName }`);

  CoerceCompodocTarget(tree, projectName, project);

  await CoerceCompodocTsConfig(tree, projectName);

}
