import {
  generateFiles,
  ProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  GetProjectRoot,
  GetTarget,
  GetTargetOptions,
  GetWorkspaceName,
  IsStandaloneWorkspace,
  Strategy,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { join } from 'path';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';
import { SwaggerGeneratorSchema } from './schema';

function coerceEnvironmentFiles(tree: Tree, options: { project: string, overwrite?: boolean }) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });

      let appName = options.project;
      if (IsStandaloneWorkspace(tree)) {
        appName = GetWorkspaceName(tree);
      }

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('swagger'),
        production: 'true',
        swagger: 'true',
        app: w => w.quote(appName),
      };

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

    },
    [
      '/environments/environment.swagger.ts?',
    ],
  );

}

function updateProjectTargets(project: ProjectConfiguration, options: SwaggerGeneratorSchema) {

  const buildTarget = GetTarget(project, 'build');
  const buildTargetOptions = GetTargetOptions(buildTarget);

  if (!buildTargetOptions['outputPath']) {
    throw new Error('The selected project has the build target without the option outputPath');
  }
  if (!buildTargetOptions['tsConfig']) {
    throw new Error('The selected project has the build target without the option tsConfig');
  }

  const outputPath = (
    buildTargetOptions['outputPath'] as string
  ).replace('dist/', 'dist/swagger/');

  CoerceTarget(project, 'swagger-build', {
    options: {
      outputPath,
      main: `${ project.sourceRoot }/swagger.ts`,
      target: `node`,
      compiler: `tsc`,
      webpackConfig: `${ project.root }/webpack.config.js`,
      transformers: [ '@nestjs/swagger/plugin' ],
      tsConfig: buildTargetOptions['tsConfig'] as string,
      fileReplacements: [
        {
          replace: `${ project.sourceRoot }/environments/environment.ts`,
          with: `${ project.sourceRoot }/environments/environment.swagger.ts`,
        },
      ],
    },
  });

  CoerceTarget(project, 'swagger-generate', {}, Strategy.REPLACE);

}

function updateNxDefaults(tree: Tree, options: SwaggerGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceNxJsonCacheableOperation(nxJson, 'swagger-build', 'swagger-generate');

  CoerceTarget(nxJson, 'swagger-generate', {
    executor: '@rxap/plugin-nestjs:swagger-generate',
    outputs: [
      `{workspaceRoot}/dist/swagger/${options.standalone ? '{projectName}' : '{projectRoot}'}/openapi.json`
    ],
    inputs: [
      `{workspaceRoot}/dist/swagger/${options.standalone ? '{projectName}' : '{projectRoot}'}/main.js`,
      `{workspaceRoot}/dist/swagger/${options.standalone ? '{projectName}' : '{projectRoot}'}/main.js.map`
    ],
    'dependsOn': [
      '^build'
    ]
  }, Strategy.REPLACE);

  CoerceTarget(nxJson, 'swagger-build', {
    executor: '@nx/webpack:webpack',
    outputs: [
      '{options.outputPath}',
    ],
    options: {
      transformers: [
        '@nestjs/swagger/plugin',
      ],
      compiler: 'tsc',
      target: 'node',
    },
    inputs: [
      'build',
      '^build',
    ],
    dependsOn: [
      '^build',
    ],
  }, Strategy.REPLACE);

  updateNxJson(tree, nxJson);
}

export async function swaggerGenerator(
  tree: Tree,
  options: SwaggerGeneratorSchema,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    join(projectRoot, 'src'),
    {
      tmpl: '',
      projectName: options.project,
    },
  );

  const project = readProjectConfiguration(tree, options.project);

  coerceEnvironmentFiles(tree, options);
  updateNxDefaults(tree, options);
  updateProjectTargets(project, options);
  const projectSourceRoot = project.sourceRoot;
  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }
  updateProjectConfiguration(tree, options.project, project);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
