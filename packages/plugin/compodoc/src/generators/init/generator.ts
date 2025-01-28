import {
  formatFiles,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ForeachInitProject,
  GenerateSerializedSchematicFile,
  InitProjectOptions,
  IsAngularProject,
  IsApplicationProject,
  IsLibraryProject,
  IsNestJsProject,
  IsWorkspaceProject,
} from '@rxap/workspace-utilities';
import { initProject as initApplicationProject } from '../init-application/init-project';
import { initProject as initLibraryProject } from '../init-library/init-project';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitProjectOptions, project: ProjectConfiguration, projectName: string): boolean {

  if (IsWorkspaceProject(project)) {
    return false;
  }

  if (IsAngularProject(project)) {
    return false;
  }

  if (IsNestJsProject(project)) {
    return false;
  }

  return true;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('compodoc init generator:', options);

  await initWorkspace(tree, options);

  for (const [projectName, project] of ForeachInitProject(tree, options, skipProject)) {

    if (IsApplicationProject(project)) {
      await initApplicationProject(tree, projectName, project, options);
    }

    if (IsLibraryProject(project)) {
      await initLibraryProject(tree, projectName, project, options);
    }

    if (IsWorkspaceProject(project)) {
      await initLibraryProject(tree, projectName, project, options);
    }

  }

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-compodoc',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
