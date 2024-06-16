import {
  formatFiles,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  unique,
} from '@rxap/utilities';
import {
  CoerceFile,
  CoerceIgnorePattern,
  CoerceTarget,
  DeleteRecursive,
  GenerateSerializedSchematicFile,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetWorkspaceScope,
  HasProject,
  Strategy,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  basename,
  join,
} from 'path';
import { stringify } from 'yaml';
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
  const apiProjectName = basename(projectRoot);

  GenerateSerializedSchematicFile(
    tree,
    projectRoot,
    '@rxap/plugin-open-api',
    'init-library',
    options,
  );

  initWorkspace(tree, options);

  const projectConfiguration = GetProject(tree, options.project);

  CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), ['src/lib']);

  if (options.external) {
    CoerceTarget(projectConfiguration, 'generate-open-api', {
      inputs: [join('{projectRoot}', 'src', 'openapi.yaml')],
      outputs: [
        join('{projectRoot}', 'src', 'lib'),
        join('{projectRoot}', 'src', 'index.ts'),
      ],
      options: {
        options: {
          project: options.project,
          path: join(projectSourceRoot, 'openapi.yaml'),
          serverId: apiProjectName
        }
      }
    }, Strategy.OVERWRITE);
    CoerceFile(tree, join(projectSourceRoot, 'openapi.yaml'), stringify({
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0'
      },
      paths: {}
    }));
  } else {
    if (!HasProject(tree, apiProjectName)) {
      throw new Error(
        `The api project '${ apiProjectName }' for the open api client sdk library '${ options.project }' does not exists!`);
    }
    // region add the implicit dependency to the api project
    projectConfiguration.implicitDependencies ??= [];
    projectConfiguration.implicitDependencies.push(apiProjectName);
    projectConfiguration.implicitDependencies = projectConfiguration.implicitDependencies.filter(unique());
    // endregion
  }


  // region cleanup
  DeleteRecursive(tree, join(projectSourceRoot, 'lib'));
  CoerceFile(tree, join(projectSourceRoot, 'index.ts'), 'export {};', true);
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

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
