import {
  formatFiles,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  GenerateSerializedSchematicFile,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitLibraryGeneratorSchema } from './schema';

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema
) {

  const projectRoot = GetProjectRoot(tree, options.project);
  console.log(`The project root is: ${projectRoot}`);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  console.log(`The project source root is: ${projectSourceRoot}`);

  GenerateSerializedSchematicFile(
    tree,
    projectRoot,
    '@rxap/plugin-open-api',
    'init-library',
    options,
  );

  initWorkspace(tree, options);

  const projectConfiguration = GetProject(tree, options.project);

  await initProject(tree, options.project, projectConfiguration, options);

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
