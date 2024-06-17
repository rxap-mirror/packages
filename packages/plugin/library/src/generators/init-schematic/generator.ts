import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  IsSchematicProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { InitPluginGeneratorSchema } from '../init-plugin/schema';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitSchematicGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitPluginGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsSchematicProject(project)) {
    return true;
  }

  return false;

}

export async function initSchematicGenerator(
  tree: Tree,
  options: InitSchematicGeneratorSchema
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('plugin library init generator:', options);

  initWorkspace(tree, options);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      initProject(tree, projectName, project, options);

      updateProjectConfiguration(tree, projectName, project);

    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initSchematicGenerator;
