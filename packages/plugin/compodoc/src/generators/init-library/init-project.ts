import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceCompodocTarget } from '../../lib/coerce-compodoc-target';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { InitLibraryGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init compodoc library project: ${ projectName }`);

  CoerceCompodocTarget(tree, projectName, project);

  CoerceCompodocTsConfig(tree, projectName);

}
