import {
  formatFiles,
  getProjects,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  GenerateSerializedSchematicFile,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitLibraryGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [ options.project ]);
  }
  console.log('storybook library init generator:', options);

  await initWorkspace(tree, options);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      await initProject(tree, projectName, project, options);

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-storybook',
        'init-library',
        DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
      );

      updateProjectConfiguration(tree, projectName, project);
    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
