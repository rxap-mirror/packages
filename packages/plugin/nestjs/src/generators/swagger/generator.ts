import {
  generateFiles,
  ProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { GetProjectRoot } from '@rxap/generator-utilities';
import {
  GetTarget,
  GetTargetOptions,
} from '@rxap/plugin-utilities';
import {
  AddPackageJsonDependency,
  CoerceTarget,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { join } from 'path';
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
    executor: '@nx/js:node',
    outputs: [
      `${ outputPath }/openapi.json`,
    ],
    options: {
      buildTarget: `${ project.name }:swagger-build`,
      watch: false,
    },
  });

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
  updateProjectConfiguration(tree, options.project, project);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
