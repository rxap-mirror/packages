import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceFile,
  CoerceIgnorePattern,
  CoerceTarget,
  GetProjectRoot,
  GetProjectSourceRoot,
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
import { InitLibraryGeneratorSchema } from './schema';
import { LibraryInitProject } from '@rxap/plugin-library';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  await LibraryInitProject(tree, projectName, project, options);

  const projectRoot = GetProjectRoot(tree, options.project);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const apiProjectName = basename(projectRoot);

  if (options.persistent) {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
  } else {
    CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
  }

  if (options.external) {
    CoerceTarget(project, 'generate-open-api', {
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
    project.implicitDependencies ??= [];
    CoerceArrayItems(project.implicitDependencies, [ apiProjectName ]);
    // endregion
  }

  CoerceTarget(project, 'build', {
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

  CoerceTarget(project, 'index-export', {
    inputs: [
      `{projectRoot}/src/index.ts`,
      `{projectRoot}/src/lib/commands/index.ts`,
      `{projectRoot}/src/lib/components/index.ts`,
      `{projectRoot}/src/lib/data-sources/index.ts`,
      `{projectRoot}/src/lib/directives/index.ts`,
      `{projectRoot}/src/lib/parameters/index.ts`,
      `{projectRoot}/src/lib/remote-method/index.ts`,
      `{projectRoot}/src/lib/request-bodies/index.ts`,
      `{projectRoot}/src/lib/responses/index.ts`,
    ]
  });


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
    // tsConfig.compilerOptions.paths[`${options.project}/*`] = [ `${projectSourceRoot}/lib/*` ];
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
}
