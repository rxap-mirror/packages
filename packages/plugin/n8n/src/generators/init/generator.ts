import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  ForeachInitProject,
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  IsN8nProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (options.project === projectName) {
    return false;
  }

  if (projectName === options.project) {
    return false;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsN8nProject(project)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [ options.project ]);
  }
  console.log('library n8n init generator:', options);

  initWorkspace(tree, options);

  for (const [projectName, project] of ForeachInitProject(tree, options, skipProject)) {

    await initProject(tree, projectName, project, options);

    GenerateSerializedSchematicFile(
      tree,
      GetProjectRoot(tree, projectName),
      '@rxap/plugin-library',
      'init',
      DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
    );

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initGenerator;
