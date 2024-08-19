import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { LibraryInitProject } from '@rxap/plugin-library';
import {
  CoerceFile,
  CoerceIgnorePattern,
  CoerceTarget,
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetTarget,
  GetTargetOptions,
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

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  await LibraryInitProject(tree, projectName, project, options);

  const projectRoot = GetProjectRoot(tree, options.project);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const apiProjectName = basename(projectRoot);

  if (options.persistent) {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib/**' ]);
  } else {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
    CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib/**' ]);
    CoerceIgnorePattern(tree, '.nxignore', [ '!/open-api/**/src/lib/**' ]);
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
    const apiProject = GetProject(tree, apiProjectName);
    const swaggerBuild = GetTarget(apiProject, 'swagger-build');
    const { outputPath: apiProjectOutputPath } = GetTargetOptions(swaggerBuild);
    CoerceTarget(project, 'generate-open-api', {
      "dependsOn": [
        {
          "projects": apiProjectName,
          "target": "swagger-generate"
        }
      ],
      "outputs": [
        "{projectRoot}/src"
      ],
      "inputs": [
        `{workspaceRoot}/${apiProjectOutputPath}/openapi.json`
      ],
      "executor": "@rxap/plugin-library:run-generator",
      "options": {
        "generator": "@rxap/plugin-open-api:generate",
        "options": {
          "path": `${apiProjectOutputPath}/openapi.json`,
          "serverId": apiProjectName
        }
      }
    });
  }

  CoerceTarget(project, 'build', {
    executor: "@nx/js:tsc",
    outputs: [ "{options.outputPath}"],
    dependsOn: [
      'generate-open-api',
    ],
    options: {
      outputPath: `dist/${projectRoot}`,
      main: `${projectSourceRoot}/index.ts`,
      tsConfig: `${projectRoot}/tsconfig.lib.json`,
      generateExportsField: true,
      additionalEntryPoints: [
        `${projectSourceRoot}/lib/commands/index.ts`,
        `${projectSourceRoot}/lib/components/index.ts`,
        // `${projectSourceRoot}/lib/data-sources/index.ts`,
        // `${projectSourceRoot}/lib/directives/index.ts`,
        `${projectSourceRoot}/lib/parameters/index.ts`,
        `${projectSourceRoot}/lib/remote-methods/index.ts`,
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
    // tsConfig.compilerOptions.paths[`${options.project}/*`] = [ `${projectSourceRoot}/lib/*` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/commands`] = [ `${projectSourceRoot}/lib/commands/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/components`] = [ `${projectSourceRoot}/lib/components/index.ts` ];
    // tsConfig.compilerOptions.paths[`${options.project}/src/lib/data-sources`] = [ `${projectSourceRoot}/lib/data-sources/index.ts` ];
    // tsConfig.compilerOptions.paths[`${options.project}/src/lib/directives`] = [ `${projectSourceRoot}/lib/directives/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/parameters`] = [ `${projectSourceRoot}/lib/parameters/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/remote-methods`] = [ `${projectSourceRoot}/lib/remote-methods/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/request-bodies`] = [ `${projectSourceRoot}/lib/request-bodies/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/responses`] = [ `${projectSourceRoot}/lib/responses/index.ts` ];
  }, { infix: 'base' });
  // endregion
}
