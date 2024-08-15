import {
  generateFiles,
  ProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  CoerceIgnorePattern,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  GetBuildOutputForProject,
  GetProjectRoot,
  GetTarget,
  GetTargetOptions,
  GetWorkspaceName,
  HasTarget,
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
      backend: undefined,
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

function updateProjectTargets(projectName: string, project: ProjectConfiguration, options: SwaggerGeneratorSchema) {

  let tsConfig = join(project.root, 'tsconfig.app.json');
  if ('build' in (project.targets ?? {})) {
    const buildTarget = GetTarget(project, 'build');
    const buildTargetOptions = GetTargetOptions(buildTarget);
    if (buildTargetOptions['tsConfig']) {
      tsConfig = buildTargetOptions['tsConfig'] as string;
    }
  }

  const outputPath = GetBuildOutputForProject(project).replace('dist/', 'swagger/');

  CoerceTarget(project, 'swagger-build', {
    options: {
      outputPath,
      main: `${ project.sourceRoot }/swagger.ts`,
      target: `node`,
      compiler: `tsc`,
      webpackConfig: `${ project.root }/webpack.config.js`,
      transformers: [ '@nestjs/swagger/plugin' ],
      tsConfig,
      fileReplacements: [
        {
          replace: `${ project.sourceRoot }/environments/environment.ts`,
          with: `${ project.sourceRoot }/environments/environment.swagger.ts`,
        },
      ],
    },
  });

  CoerceTarget(project, 'swagger-generate', {
    outputs: [
      `{workspaceRoot}/swagger/${options.standalone ? projectName : project.root }/openapi.json`
    ],
    inputs: [
      `{workspaceRoot}/swagger/${options.standalone ? projectName : project.root}/main.js`,
    ],
  }, Strategy.REPLACE);

}

function updateNxDefaults(tree: Tree, options: SwaggerGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceNxJsonCacheableOperation(nxJson, 'swagger-build', 'swagger-generate');

  CoerceTarget(nxJson, 'swagger-generate', {
    executor: '@rxap/plugin-nestjs:swagger-generate',
    'dependsOn': [
      'swagger-build'
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
      deleteOutputPath: false,
    },
    inputs: [
      'build',
      '^build',
    ],
    dependsOn: [
      '^build',
    ],
  }, Strategy.OVERWRITE);

  updateNxJson(tree, nxJson);
}

export async function swaggerGenerator(
  tree: Tree,
  options: SwaggerGeneratorSchema,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  const projectName = options.project;
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    join(projectRoot, 'src'),
    {
      tmpl: '',
      projectName,
    },
  );

  const project = readProjectConfiguration(tree, options.project);

  coerceEnvironmentFiles(tree, options);
  updateNxDefaults(tree, options);
  updateProjectTargets(projectName, project, options);
  const projectSourceRoot = project.sourceRoot;
  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }
  updateProjectConfiguration(tree, options.project, project);

  CoerceIgnorePattern(tree, '.nxignore', [ '!/swagger/**' ]);
  CoerceIgnorePattern(tree, '.gitignore', [ 'swagger/**' ]);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
