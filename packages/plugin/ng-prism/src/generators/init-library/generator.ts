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
import initGenerator from '../init/generator';
import { initProject } from './init-project';
import { InitLibraryGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  options.prismProject ??= 'prism-host';
  if (options.project) {
    CoerceArrayItems(options.projects, [ options.project ]);
  }
  console.log('ng-prism library init generator:', options);

  await initGenerator(tree, { prismProject: options.prismProject, skipFormat: true });

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      await initProject(tree, projectName, project, options);

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-ng-prism',
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
