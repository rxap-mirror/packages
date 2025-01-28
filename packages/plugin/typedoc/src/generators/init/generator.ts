import {
  formatFiles,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ForeachInitProject,
  GenerateSerializedSchematicFile,
  GetProjectSourceRoot,
  InitProjectOptions,
  IsApplicationProject,
  IsLibraryProject,
  IsWorkspaceProject,
} from '@rxap/workspace-utilities';
import { initProject as initApplicationProject } from '../init-application/init-project';
import { initProject as initLibraryProject } from '../init-library/init-project';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';
import { join } from 'path';

function skipProject(tree: Tree, options: InitProjectOptions, project: ProjectConfiguration, projectName: string): boolean {

  if (IsWorkspaceProject(project)) {
    return false;
  }

  if (!tree.exists(join(project.root, 'tsconfig.json'))) {
    return true;
  }

  if (!tree.exists(join(project.sourceRoot, 'index.ts'))) {
    return true;
  }

  if (project.tags?.includes('internal')) {
    return true;
  }

  if (IsLibraryProject(project)) {
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
  console.log('typedoc init generator:', options);

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
    '@rxap/plugin-typedoc',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initGenerator;
