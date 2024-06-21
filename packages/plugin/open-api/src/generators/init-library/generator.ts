import {
  formatFiles,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceFile,
  CoerceIgnorePattern,
  CoerceTarget,
  GenerateSerializedSchematicFile,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetWorkspaceScope,
  HasProject,
  RemoveIgnorePattern,
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

  if (options.persistent) {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
  } else {
    CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
  }

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
    CoerceArrayItems(projectConfiguration.implicitDependencies, [ apiProjectName ]);
    // endregion
  }

  CoerceTarget(projectConfiguration, 'build', {
    executor: "@nx/js:tsc",
    outputs: [ "{options.outputPath}"],
    options: {
      outputPath: `dist/${projectRoot}`,
      main: `${projectSourceRoot}/index.ts`,
      tsConfig: `${projectRoot}/tsconfig.lib.json`,
      generateExportsField: true,
      additionalEntryPoints: [
        `${projectSourceRoot}/lib/commands/index.ts`,
        `${projectSourceRoot}/lib/components/index.ts`,
        `${projectSourceRoot}/lib/data-sources/index.ts`,
        `${projectSourceRoot}/lib/directives/index.ts`,
        `${projectSourceRoot}/lib/parameters/index.ts`,
        `${projectSourceRoot}/lib/remote-method/index.ts`,
        `${projectSourceRoot}/lib/request-bodies/index.ts`,
        `${projectSourceRoot}/lib/responses/index.ts`,
      ],
    }
  }, Strategy.OVERWRITE);


  // region cleanup
  if (tree.exists(join(projectSourceRoot, 'lib', `${ options.project }.ts`))) {
    tree.delete(join(projectSourceRoot, 'lib', `${ options.project }.ts`));
  }
  if (tree.exists(join(projectSourceRoot, 'lib', `${ options.project }.spec.ts`))) {
    tree.delete(join(projectSourceRoot, 'lib', `${ options.project }.spec.ts`));
  }
  if (tree.exists(join(projectSourceRoot, 'index.ts'))) {
    let indexFileContent = tree.read(join(projectSourceRoot, 'index.ts'), 'utf-8');
    if (indexFileContent) {
      indexFileContent = indexFileContent.replace(
        new RegExp(`export \\* from './lib/${options.project}';\n`, 'g'), '');
      CoerceFile(tree, join(projectSourceRoot, 'index.ts'), indexFileContent, true);
    }
  }
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
    tsConfig.compilerOptions.paths[`${options.project}/*`] = [ `${projectSourceRoot}/lib/*` ];
    tsConfig.compilerOptions.paths[`${options.project}/commands`] = [ `${projectSourceRoot}/lib/components/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/components`] = [ `${projectSourceRoot}/lib/components/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/data-sources`] = [ `${projectSourceRoot}/lib/data-sources/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/directives`] = [ `${projectSourceRoot}/lib/directives/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/parameters`] = [ `${projectSourceRoot}/lib/parameters/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/remote-methods`] = [ `${projectSourceRoot}/lib/remote-method/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/request-bodies`] = [ `${projectSourceRoot}/lib/request-bodies/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/responses`] = [ `${projectSourceRoot}/lib/responses/index.ts` ];
  }, { infix: 'base' });
  // endregion

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
