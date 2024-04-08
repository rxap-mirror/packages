import {
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  DeleteRecursive,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetWorkspaceScope,
  HasProject,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import { basename } from 'path';
import { InitLibraryGeneratorSchema } from './schema';

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  console.log(`The project root is: ${projectRoot}`);
  const apiProjectName = basename(projectRoot);
  if (!HasProject(tree, apiProjectName)) {
    throw new Error(`The api project '${apiProjectName}' for the open api client sdk library '${options.project}' does not exists!`);
  }
  // region delete the source directory
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  DeleteRecursive(tree, projectSourceRoot);
  tree.write(`${projectSourceRoot}/index.ts`, 'export {};');
  // endregion
  // region add the implicit dependency to the api project
  const projectConfiguration = GetProject(tree, options.project);
  projectConfiguration.implicitDependencies ??= [];
  projectConfiguration.implicitDependencies.push(apiProjectName);
  updateProjectConfiguration(tree, options.project, projectConfiguration);
  // endregion
  // region align the tsconfig.base.json
  const tsConfigBasePath = `tsconfig.base.json`;
  if (!tree.exists(tsConfigBasePath)) {
    throw new Error(`The tsconfig.base.json file does not exists in the workspace root!`);
  }
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.paths ??= {};
    if (tsConfig.compilerOptions.paths[options.project]) {
      delete tsConfig.compilerOptions.paths[options.project];
    }
    const scope = GetWorkspaceScope(tree);
    tsConfig.compilerOptions.paths[`${options.project}/*`] = [ `${projectSourceRoot}/lib/*` ];
    tsConfig.compilerOptions.paths[`${scope}/open-api/*`] ??= [];
    CoerceArrayItems(tsConfig.compilerOptions.paths[`${scope}/open-api/*`], tsConfig.compilerOptions.paths[`${options.project}/*`]);
  }, { infix: 'base' });
  // endregion
}

export default initLibraryGenerator;
