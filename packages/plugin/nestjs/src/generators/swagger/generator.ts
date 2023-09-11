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
  CoerceAssets,
  CoerceIgnorePattern,
  GetProjectRoot,
} from '@rxap/generator-utilities';
import {
  GetTarget,
  GetTargetOptions,
} from '@rxap/plugin-utilities';
import {
  CoerceClassProperty,
  CoerceImports,
  CoerceNestOperation,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { join } from 'path';
import { Scope } from 'ts-morph';
import { SwaggerGeneratorSchema } from './schema';

function updateProjectTargets(project: ProjectConfiguration) {

  const buildTarget = GetTarget(project, 'build');
  const buildTargetOptions = GetTargetOptions(buildTarget);

  if (!buildTargetOptions['outputPath']) {
    throw new Error('The selected project has the build target without the option outputPath');
  }
  if (!buildTargetOptions['tsConfig']) {
    throw new Error('The selected project has the build target without the option tsConfig');
  }

  const outputPath = (buildTargetOptions['outputPath'] as string).replace('dist/', 'dist/swagger/');

  CoerceTarget(project, 'swagger-build', {
    executor: '@nx/webpack:webpack',
    outputs: [ '{options.outputPath}' ],
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

  CoerceTarget(project, 'swagger-generate', {
    executor: 'nx:run-commands',
    outputs: [
      `dist/swagger/{projectRoot}/openapi.json`,
    ],
    options: {
      command: `node ${ outputPath }/main.js`,
    },
  });

  const projectSourceRoot = project.sourceRoot;

  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }

  CoerceTarget(project, 'copy-open-api-json', {
    executor: 'nx:run-commands',
    outputs: [
      `{projectRoot}/src/openapi.json`,
    ],
    inputs: [
      `{workspaceRoot}/dist/swagger/{projectRoot}/openapi.json`,
    ],
    options: {
      command: `cp ${ outputPath }/openapi.json ${ projectSourceRoot }/openapi.json`,
    },
  }, Strategy.OVERWRITE);

  buildTargetOptions.assets ??= [];

  CoerceAssets(buildTargetOptions.assets as string[], [ `${ projectSourceRoot }/openapi.json` ]);
  const developmentBuildOptions = GetTargetOptions(buildTarget, 'development');
  developmentBuildOptions.assets ??= [];
  CoerceAssets(developmentBuildOptions.assets as string[], [ `${ projectSourceRoot }/openapi.json` ]);

}

function updateNxDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  nxJson.tasksRunnerOptions ??= {};
  nxJson.tasksRunnerOptions['default'] ??= {
    runner: 'nx-cloud',
    options: {},
  };
  nxJson.tasksRunnerOptions['default'].options ??= {};
  nxJson.tasksRunnerOptions['default'].options['cacheableOperations'] ??= [];
  if (!nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].includes('swagger-build')) {
    nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].push('swagger-build');
  }
  if (!nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].includes('swagger-generate')) {
    nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].push('swagger-generate');
  }
  if (!nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].includes('copy-open-api-json')) {
    nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].push('copy-open-api-json');
  }

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

  updateNxDefaults(tree);
  updateProjectTargets(project);
  const projectSourceRoot = project.sourceRoot;
  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }
  CoerceIgnorePattern(tree, join(projectSourceRoot, '.gitignore'), [ '/openapi.json' ]);

  updateProjectConfiguration(tree, options.project, project);

  TsMorphNestProjectTransform(tree, { project: options.project }, (_, [ sourceFile ]) => {
    console.log('sourceFile', sourceFile);

    CoerceNestOperation(sourceFile, {
      operationName: 'openapi',
      path: 'openapi',
      statements: [
        'return GetOpenapiJson(__dirname, this.logger);',
      ],
    });
    const classDeclaration = sourceFile.getClass('AppController');
    CoerceClassProperty(classDeclaration, 'logger', {
      scope: Scope.Private,
      isReadonly: true,
      hasExclamationToken: true,
      type: 'Logger',
      decorators: [
        {
          name: 'Inject',
          arguments: [ 'Logger' ],
        },
      ],
    });
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'Logger', 'Inject' ],
        moduleSpecifier: '@nestjs/common',
      },
      {
        namedImports: [ 'GetOpenapiJson' ],
        moduleSpecifier: '@rxap/nest-open-api',
      },
    ]);

  }, [ 'app/app.controller.ts' ]);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
