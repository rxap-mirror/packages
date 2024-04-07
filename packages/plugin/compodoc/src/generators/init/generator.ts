import {
  getProjects,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProjectSourceRoot,
  SkipNonAngularProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceCompodocTarget } from '../../lib/coerce-compodoc-target';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('compodoc init generator:', options);

  await initWorkspace(tree, options);

  const project = readProjectConfiguration(tree, 'workspace');
  CoerceCompodocTarget(tree, 'workspace', project);
  updateProjectConfiguration(tree, 'workspace', project);
  const angularProjectIncludeList = Array.from(getProjects(tree))
    .filter(([projectName, project]) => !SkipNonAngularProject(tree, {}, project, projectName))
    .map(([projectName]) => GetProjectSourceRoot(tree, projectName))
    .map(sourceRoot => join(sourceRoot, '**/*.ts'));
  await CoerceCompodocTsConfig(tree, 'workspace', angularProjectIncludeList);

}

export default initGenerator;
