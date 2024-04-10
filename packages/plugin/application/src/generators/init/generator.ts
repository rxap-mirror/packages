import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { DockerGitlabCiGenerator } from '@rxap/plugin-docker';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  SkipNonApplicationProject,
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

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;
}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.overwrite ??= false;
  options.skipProjects ??= false;
  options.authentik ??= false;
  options.minio ??= false;
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('application init generator:', options);

  await initWorkspace(tree, options);

  if (!options.skipProjects) {
    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-application',
        'init',
        DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
      );

      initProject(tree, projectName, project, options);

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }

  }

  await DockerGitlabCiGenerator(tree, {});

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
